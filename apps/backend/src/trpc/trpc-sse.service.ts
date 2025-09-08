import { Injectable } from '@nestjs/common';
import { UiGenerationSSEService } from '../services/ui-generation-sse.service';
import { SSEService } from '../services/sse.service';
import { Response } from 'express';

@Injectable()
export class TrpcSSEService {
  constructor(
    private readonly uiGenerationSSEService: UiGenerationSSEService,
    private readonly sseService: SSEService,
  ) {}

  async generateUISSE(
    input: {
      prompt: string;
      projectId: string;
      currentSchema?: any;
    },
    res: Response
  ) {
    try {
      // Create SSE controller
      const sseController = this.sseService.createSSEController(res);

      // Send initial message
      sseController.sendMessage('status', '🚀 Starting UI generation...');

      // Start the generation process
      await this.uiGenerationSSEService.generateUIWithSSE({
        prompt: input.prompt,
        projectId: input.projectId,
        currentSchema: input.currentSchema,
      }, sseController);

    } catch (error) {
      console.error('Error in SSE generateUI:', error);
      
      // Try to send error through SSE if possible
      try {
        const sseController = this.sseService.createSSEController(res);
        sseController.sendError('Failed to initialize UI generation', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      } catch (sseError) {
        // If SSE fails, send regular HTTP error
        if (!res.headersSent) {
          res.status(500).json({
            error: 'Failed to initialize SSE stream',
            details: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    }
  }

  async getHealthSSE() {
    return await this.uiGenerationSSEService.healthCheck();
  }

  async getStatusSSE() {
    return this.uiGenerationSSEService.getStatus();
  }
}