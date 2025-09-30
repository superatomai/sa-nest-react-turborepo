import { Controller, Get, Post, Delete, Query, Body, HttpException, HttpStatus, Res, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { WebSocketManagerService } from './services/websocket-manager.service';
import { TrpcSSEService } from './trpc/trpc-sse.service';
import { LlmService } from './services/llm.service';
import { ClaudeUIGenerationSSEService } from './claude-agent-sdk/services/claude-ui-generation-sse.service';
import { ClaudeUIAgentService } from './claude-agent-sdk/services/claude-ui-agent.service';
import { SSEService } from './services/sse.service';
import { JSXToDSLService } from './services/jsx-to-dsl.service';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly webSocketManagerService: WebSocketManagerService,
    private readonly trpcSSEService: TrpcSSEService,
    private readonly llmService: LlmService,
    private readonly claudeUIGenerationSSEService: ClaudeUIGenerationSSEService,
    private readonly claudeUIAgentService: ClaudeUIAgentService,
    private readonly sseService: SSEService,
    private readonly jsxToDSLService: JSXToDSLService
  ) {}

  @Get()
  getSystemHealth(): any {
    return {
      server: 'SuperAtom Runtime Backend',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '0.0.5',
      endpoints: {
        system: {
          'GET /': 'System health and API documentation',
          'GET /agent-status': 'Get all agent connection statuses',
          'GET /agent-status/:projectId': 'Get agent status for specific project'
        },
        docs: {
          'GET /init-docs': 'Get GraphQL docs for a project (requires projectId query param)'
        },
        execution: {
          'POST /execute-query': 'Execute GraphQL query for a project'
        },
        ui: {
          'POST /generate-ui-sse': 'Generate UI with Server-Sent Events streaming',
          'POST /claude/generate-ui-sse': 'Generate UI with Claude Agent using SSE streaming',
          'POST /test-provider-fallback': 'Test provider fallback system with forced failures',
          'POST /init-ui': 'Generate UI suggestions from docs',
          'POST /init-ui/from-project': 'Generate UI suggestions from project ID'
        },
        claude: {
          'GET /claude/project-info/:projectId': 'Get Claude project information and UI history',
          'GET /claude/ui-history/:projectId': 'Get UI generation history for project',
          'GET /claude/ui/:projectId/:uiId': 'Get specific UI by ID',
          'GET /claude/jsx/:projectId/:uiId': 'Get JSX content for specific UI',
          'DELETE /claude/ui/:projectId/:uiId': 'Delete specific UI by ID',
          'GET /claude/health': 'Claude Agent SDK health check'
        },
        conversion: {
          'POST /jsx-to-dsl': 'Convert JSX content to UIComponent DSL format using Groq LLM',
          'GET /jsx-to-dsl/health': 'JSX to DSL conversion service health check'
        },
        deployment: {
          'GET /deployment/pull-reload': 'Pull latest code and reload PM2 process'
        },
        webhooks: {
          'POST /webhooks/clerk': 'Clerk webhook endpoint for organization events (auto-creates demo content)'
        },
        websocket: {
          'WS /': 'WebSocket connection for real-time communication'
        }
      },
      connectedProjects: this.webSocketManagerService.getConnectedUsers().length,
      uptime: process.uptime()
    };
  }

  @Get('init-docs')
  async getDocs(
    @Query('projectId') projectId: string,
  ): Promise<any> {
    if (!projectId) {
      throw new HttpException('projectId is required', HttpStatus.BAD_REQUEST);
    }

    try {
      const docs = await this.webSocketManagerService.getDocsForUser(projectId);
      return docs;
    } catch (error) {
      console.error('Error fetching docs:', error);
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to fetch docs',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('execute-query')
  async executeQuery(
    @Body() body: {
      projectId: string;
      query: string;
      variables?: Record<string, any>;
    }
  ): Promise<any> {
    if (!body.projectId) {
      throw new HttpException('projectId is required', HttpStatus.BAD_REQUEST);
    }

    if (!body.query) {
      throw new HttpException('query is required', HttpStatus.BAD_REQUEST);
    }

    try {
      const result = await this.webSocketManagerService.executeQueryForUser(
        body.projectId,
        body.query,
        body.variables || {}
      );

      return {
        success: true,
        data: result.data,
        projectId: body.projectId,
        query: body.query,
        variables: body.variables || {},
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error executing query:', error);
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to execute query',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('generate-ui-sse')
  async generateUISSE(
    @Body() body: {
      prompt: string;
      projectId: string;
      currentSchema?: any;
    },
    @Res() res: Response
  ) {
    try {
      await this.trpcSSEService.generateUISSE(body, res);
    } catch (error) {
      console.error('Error in generateUISSE endpoint:', error);
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  @Get('agent-status/:projectId')
  async getAgentStatus(@Param('projectId') projectId: string) {
    if (!projectId) {
      throw new HttpException('projectId is required', HttpStatus.BAD_REQUEST);
    }

    try {
      const agentStatus = await this.webSocketManagerService.checkAgentConnectionForProject(projectId);
      return {
        success: true,
        data: agentStatus,
        projectId: projectId,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error checking agent status:', error);
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to check agent status',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('test-provider-fallback')
  async testProviderFallback(
    @Body() body: {
      prompt: string;
      projectId: string;
      currentSchema?: any;
      forceFailProviders?: ('groq' | 'gemini' | 'openrouter')[];
    },
    @Res() res: Response
  ) {
    try {
      console.log('🧪 [TEST MODE] Force fail providers:', body.forceFailProviders || 'none');

      // Temporarily set environment variables for testing
      const originalEnv = {
        FORCE_GROQ_FAIL: process.env.FORCE_GROQ_FAIL,
        FORCE_GEMINI_FAIL: process.env.FORCE_GEMINI_FAIL,
        FORCE_OPENROUTER_FAIL: process.env.FORCE_OPENROUTER_FAIL,
      };

      // Set test failures
      if (body.forceFailProviders?.includes('groq')) {
        process.env.FORCE_GROQ_FAIL = 'true';
      }
      if (body.forceFailProviders?.includes('gemini')) {
        process.env.FORCE_GEMINI_FAIL = 'true';
      }
      if (body.forceFailProviders?.includes('openrouter')) {
        process.env.FORCE_OPENROUTER_FAIL = 'true';
      }

      // Call the SSE endpoint
      await this.trpcSSEService.generateUISSE(body, res);

      // Restore original environment
      process.env.FORCE_GROQ_FAIL = originalEnv.FORCE_GROQ_FAIL;
      process.env.FORCE_GEMINI_FAIL = originalEnv.FORCE_GEMINI_FAIL;
      process.env.FORCE_OPENROUTER_FAIL = originalEnv.FORCE_OPENROUTER_FAIL;

    } catch (error) {
      console.error('🧪 [TEST MODE] Error in test endpoint:', error);
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Test endpoint error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  @Get('agent-status')
  async getAllAgentStatus() {
    try {
      const connectionStatus = this.webSocketManagerService.getStatus();
      const connectedProjects = this.webSocketManagerService.getConnectedUsers();
      
      // Get agent status for all connected projects
      const agentStatusPromises = connectedProjects.map(async (projectId) => {
        try {
          const agentStatus = await this.webSocketManagerService.checkAgentConnectionForProject(projectId);
          return {
            projectId,
            ...agentStatus
          };
        } catch (error) {
          return {
            projectId,
            hasAgent: false,
            agentCount: 0,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      });

      const agentStatuses = await Promise.all(agentStatusPromises);

      return {
        success: true,
        data: {
          connectionSummary: connectionStatus,
          agentStatuses: agentStatuses
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error checking all agent statuses:', error);
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to check agent statuses',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('claude/generate-ui-sse')
  async generateUIClaudeSSE(
    @Body() body: {
      prompt: string;
      projectId: string;
      uiId: string;
      currentSchema?: any;
    },
    @Res() res: Response
  ) {
    try {
      const controller = this.sseService.createSSEController(res);

      await this.claudeUIGenerationSSEService.generateUIWithClaudeSSE(
        {
          prompt: body.prompt,
          currentSchema: body.currentSchema || {
            id: 'root',
            type: 'UIComponent',
            render: { type: 'div', props: {}, children: [] },
            data: {}
          },
          projectId: body.projectId,
          uiId: body.uiId
        },
        controller
      );
    } catch (error) {
      console.error('Error in generateUIClaudeSSE endpoint:', error);
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  @Get('claude/project-info/:projectId')
  async getClaudeProjectInfo(@Param('projectId') projectId: string) {
    if (!projectId) {
      throw new HttpException('projectId is required', HttpStatus.BAD_REQUEST);
    }

    try {
      const projectInfo = await this.claudeUIAgentService.getProjectInfo(projectId);
      return {
        success: true,
        data: projectInfo.data,
        projectId: projectId,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting Claude project info:', error);
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to get project info',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('claude/ui-history/:projectId')
  async getClaudeUIHistory(@Param('projectId') projectId: string) {
    if (!projectId) {
      throw new HttpException('projectId is required', HttpStatus.BAD_REQUEST);
    }

    try {
      const history = await this.claudeUIAgentService.getUIHistory(projectId);
      return {
        success: true,
        data: history.data,
        projectId: projectId,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting Claude UI history:', error);
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to get UI history',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('claude/ui/:projectId/:uiId')
  async getClaudeUI(@Param('projectId') projectId: string, @Param('uiId') uiId: string) {
    if (!projectId || !uiId) {
      throw new HttpException('projectId and uiId are required', HttpStatus.BAD_REQUEST);
    }

    try {
      const ui = await this.claudeUIAgentService.getUIById(projectId, uiId);
      if (!ui.success) {
        throw new HttpException(ui.error || 'UI not found', HttpStatus.NOT_FOUND);
      }
      return {
        success: true,
        data: ui.data,
        projectId: projectId,
        uiId: uiId,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting Claude UI:', error);
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to get UI',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('claude/jsx/:projectId/:uiId')
  async getClaudeJSX(@Param('projectId') projectId: string, @Param('uiId') uiId: string) {
    if (!projectId || !uiId) {
      throw new HttpException('projectId and uiId are required', HttpStatus.BAD_REQUEST);
    }

    try {
      const jsx = await this.claudeUIAgentService.getJSXContent(projectId, uiId);
      if (!jsx.success) {
        throw new HttpException(jsx.error || 'JSX not found', HttpStatus.NOT_FOUND);
      }
      return {
        success: true,
        jsxContent: jsx.jsxContent,
        projectId: projectId,
        uiId: uiId,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting Claude JSX:', error);
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to get JSX',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete('claude/ui/:projectId/:uiId')
  async deleteClaudeUI(@Param('projectId') projectId: string, @Param('uiId') uiId: string) {
    if (!projectId || !uiId) {
      throw new HttpException('projectId and uiId are required', HttpStatus.BAD_REQUEST);
    }

    try {
      const result = await this.claudeUIAgentService.deleteUI(projectId, uiId);
      if (!result.success) {
        throw new HttpException(result.error || 'Failed to delete UI', HttpStatus.BAD_REQUEST);
      }
      return {
        success: true,
        message: 'UI deleted successfully',
        projectId: projectId,
        uiId: uiId,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error deleting Claude UI:', error);
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to delete UI',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('claude/health')
  async getClaudeHealth() {
    try {
      const health = await this.claudeUIAgentService.healthCheck();
      return {
        success: true,
        data: health,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error checking Claude health:', error);
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to check Claude health',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('jsx-to-dsl')
  async convertJSXToDSL(
    @Body() body: {
      jsxContent: string;
      projectId?: string;
      uiId?: string;
    }
  ) {
    try {
      if (!body.jsxContent) {
        throw new HttpException('jsxContent is required', HttpStatus.BAD_REQUEST);
      }

      const result = await this.jsxToDSLService.convertJSXToDSL({
        jsxContent: body.jsxContent,
        projectId: body.projectId,
        uiId: body.uiId
      });

      if (!result.success) {
        throw new HttpException(
          result.error || 'Failed to convert JSX to DSL',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      return {
        success: true,
        data: result.data,
        originalJSX: result.originalJSX,
        metadata: result.metadata,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error converting JSX to DSL:', error);
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to convert JSX to DSL',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('jsx-to-dsl/health')
  async getJSXToDSLHealth() {
    try {
      const health = await this.jsxToDSLService.healthCheck();
      return {
        success: true,
        data: health,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error checking JSX to DSL health:', error);
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to check JSX to DSL health',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
