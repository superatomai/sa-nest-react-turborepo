import { Controller, Get, Post, Body, Query, HttpException, HttpStatus, Sse, MessageEvent } from '@nestjs/common';
import { RuntimeService } from './runtime.service';
import { Observable } from 'rxjs';

export interface RuntimeQueryDto {
  query: string;
  projectId: string;
  context?: {
    currentSchema?: any;
    userContext?: string;
    projectMetadata?: any;
  };
  options?: {
    streaming?: boolean;
    maxTokens?: number;
    temperature?: number;
  };
}

export interface RuntimeUIResponse {
  success: boolean;
  data?: {
    uiDSL: any;
    explanation?: string;
    confidence?: number;
  };
  error?: string;
  metadata?: {
    tokensUsed?: number;
    inferenceTime?: number;
    model?: string;
  };
}

@Controller('runtime')
export class RuntimeController {
  constructor(private readonly runtimeService: RuntimeService) {}

  /**
   * Generate UI DSL based on user query and project context (GET)
   * GET /runtime/generate-ui?query=<question>&projectid=<id>
   */
  @Get('generate-ui')
  async generateUIFromQuery(
    @Query('query') query: string,
    @Query('projectid') projectId: string,
    @Query('temperature') temperature?: string,
    @Query('maxTokens') maxTokens?: string
  ): Promise<RuntimeUIResponse> {
    try {
      if (!query || !projectId) {
        throw new HttpException(
          'Missing required query parameters: query and projectid',
          HttpStatus.BAD_REQUEST
        );
      }

      const result = await this.runtimeService.generateUIFromQuery({
        query,
        projectId,
        context: {},
        options: {
          temperature: temperature ? parseFloat(temperature) : 0.7,
          maxTokens: maxTokens ? parseInt(maxTokens) : 4000,
        },
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Runtime UI generation error (GET):', error);

      if (error instanceof HttpException) {
        throw error;
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Generate UI DSL based on user query and project context (POST)
   * POST /runtime/generate-ui
   */
  @Post('generate-ui')
  async generateUI(@Body() body: RuntimeQueryDto): Promise<RuntimeUIResponse> {
    try {
      const { query, projectId, context, options } = body;

      if (!query || !projectId) {
        throw new HttpException(
          'Missing required fields: query and projectId',
          HttpStatus.BAD_REQUEST
        );
      }

      const result = await this.runtimeService.generateUIFromQuery({
        query,
        projectId,
        context: context || {},
        options: options || {},
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Runtime UI generation error:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Stream UI DSL generation with real-time updates
   * SSE /runtime/generate-ui-stream
   */
  @Sse('generate-ui-stream')
  generateUIStream(@Body() body: RuntimeQueryDto): Observable<MessageEvent> {
    try {
      const { query, projectId, context, options } = body;

      if (!query || !projectId) {
        throw new HttpException(
          'Missing required fields: query and projectId',
          HttpStatus.BAD_REQUEST
        );
      }

      return this.runtimeService.generateUIStreamFromQuery({
        query,
        projectId,
        context: context || {},
        options: { ...options, streaming: true },
      });
    } catch (error) {
      console.error('Runtime UI streaming error:', error);
      throw new HttpException(
        error instanceof Error ? error.message : 'Unknown error occurred',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get runtime agent capabilities and supported features
   * GET /runtime/capabilities
   */
  @Post('capabilities')
  async getCapabilities(@Body() body: { projectId: string }) {
    try {
      const capabilities = await this.runtimeService.getCapabilities(body.projectId);
      return {
        success: true,
        data: capabilities,
      };
    } catch (error) {
      console.error('Error fetching runtime capabilities:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}