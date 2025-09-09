import { Injectable } from '@nestjs/common';
import { UiGenerationService } from '../services/ui-generation.service';
import { TrpcSSEService } from './trpc-sse.service';
import { Response } from 'express';

@Injectable()
export class TrpcService {
  constructor(
    private readonly uiGenerationService: UiGenerationService,
    private readonly trpcSSEService: TrpcSSEService,
  ) {}

  async generateUI(input: {
    prompt: string;
    projectId: string;
    currentSchema?: any;
  }) {
    return await this.uiGenerationService.generateUI({
      prompt: input.prompt,
      projectId: input.projectId,
      currentSchema: input.currentSchema,
    });
  }

  async getHealth() {
    return await this.uiGenerationService.healthCheck();
  }

  async getStatus() {
    return this.uiGenerationService.getStatus();
  }

  // SSE Methods
  async generateUISSE(input: {
    prompt: string;
    projectId: string;
    currentSchema?: any;
  }, res: Response) {
    return await this.trpcSSEService.generateUISSE(input, res);
  }

  async getHealthSSE() {
    return await this.trpcSSEService.getHealthSSE();
  }

  async getStatusSSE() {
    return await this.trpcSSEService.getStatusSSE();
  }

}