import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

@Injectable()
export class DeploymentService {
  private readonly logger = new Logger(DeploymentService.name);
  private execAsync = promisify(exec);

  async pullAndReload(): Promise<{ success: boolean; message: string; output?: string; error?: string }> {
    try {
      this.logger.log('Starting pull and reload process...');

      // Get the root directory (go up from apps/backend to project root)
      const rootDir = path.resolve(__dirname, '../../../../');
      const scriptPath = path.join(rootDir, 'pull-reload.sh');

      this.logger.log(`Executing script: ${scriptPath}`);

      const { stdout, stderr } = await this.execAsync(`bash "${scriptPath}"`, {
        cwd: rootDir,
        timeout: 300000, // 5 minutes timeout
      });

      this.logger.log('Pull and reload completed successfully');

      return {
        success: true,
        message: 'Pull and reload completed successfully',
        output: stdout,
      };
    } catch (error) {
      this.logger.error('Pull and reload failed:', error);

      return {
        success: false,
        message: 'Pull and reload failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}