import { Injectable } from '@nestjs/common';
import { TrpcSSEService } from './trpc-sse.service';
import { Response } from 'express';

@Injectable()
export class TrpcService {
  constructor(
    private readonly trpcSSEService: TrpcSSEService,
  ) {}
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