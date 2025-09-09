import { Controller, Get, Post, Query, Body, HttpException, HttpStatus, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { WebSocketManagerService } from './services/websocket-manager.service';
import { TrpcSSEService } from './trpc/trpc-sse.service';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly webSocketManagerService: WebSocketManagerService,
    private readonly trpcSSEService: TrpcSSEService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('get')
  async getDocs(
    @Query('projectId') projectId: string,
    @Query('type') type: string,
  ): Promise<any> {
    if (!projectId) {
      throw new HttpException('projectId is required', HttpStatus.BAD_REQUEST);
    }

    if (type !== 'get_docs') {
      throw new HttpException('type must be "get_docs"', HttpStatus.BAD_REQUEST);
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
}
