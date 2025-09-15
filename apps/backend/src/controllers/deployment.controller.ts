import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { DeploymentService } from '../services/deployment.service';

@Controller('deployment')
export class DeploymentController {
  constructor(private readonly deploymentService: DeploymentService) {}

  @Get('pull-reload')
  async pullReload() {
    try {
      const result = await this.deploymentService.pullAndReload();

      if (!result.success) {
        throw new HttpException(
          result.message,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      return {
        success: true,
        message: result.message,
        output: result.output,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to execute pull and reload',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}