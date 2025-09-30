import { Module } from '@nestjs/common';
import { ClaudeUIAgentService } from './services/claude-ui-agent.service';
import { ClaudeUIGenerationSSEService } from './services/claude-ui-generation-sse.service';
import { ProjectFileManager } from './utils/project-file-manager';
import { WebSocketManagerService } from '../services/websocket-manager.service';
import { ProjectSchemaCacheService } from '../services/project-schema-cache.service';

@Module({
  providers: [
    ClaudeUIAgentService,
    ClaudeUIGenerationSSEService,
    ProjectFileManager,
    WebSocketManagerService,
    ProjectSchemaCacheService,
  ],
  exports: [
    ClaudeUIAgentService,
    ClaudeUIGenerationSSEService,
    ProjectFileManager,
  ],
})
export class ClaudeAgentModule {}