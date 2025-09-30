import { Controller, Get, Post, Query, Body, HttpException, HttpStatus, Res, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { WebSocketManagerService } from './services/websocket-manager.service';
import { TrpcSSEService } from './trpc/trpc-sse.service';
import { LlmService } from './services/llm.service';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly webSocketManagerService: WebSocketManagerService,
    private readonly trpcSSEService: TrpcSSEService,
    private readonly llmService: LlmService
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
          'POST /test-provider-fallback': 'Test provider fallback system with forced failures',
          'POST /init-ui': 'Generate UI suggestions from docs',
          'POST /init-ui/from-project': 'Generate UI suggestions from project ID'
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
}
