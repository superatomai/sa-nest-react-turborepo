import { Injectable } from '@nestjs/common';
import { UiGenerationService } from '../services/ui-generation.service';

@Injectable()
export class TrpcService {
  constructor(
    private readonly uiGenerationService: UiGenerationService,
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

  async getStats() {
    return this.uiGenerationService.getStats();
  }
}