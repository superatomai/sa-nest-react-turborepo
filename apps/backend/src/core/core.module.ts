import { Global, Module } from '@nestjs/common';
import { LlmService } from '../services/llm.service';
import { WebSocketManagerService } from '../services/websocket-manager.service';
import { UiGenerationSSEService } from '../services/ui-generation-sse.service';
import { UiUtilsService } from '../services/ui-utils.service';
import { SSEService } from '../services/sse.service';
import { ProjectSchemaCacheService } from '../services/project-schema-cache.service';
import { UisService } from '../uis/uis.service';
import { VersionsService } from '../uis/versions.service';

@Global()
@Module({
  providers: [
    LlmService,
    WebSocketManagerService,
    UiGenerationSSEService,
    UiUtilsService,
    SSEService,
    ProjectSchemaCacheService,
    UisService,
    VersionsService,
  ],
  exports: [
    LlmService,
    WebSocketManagerService,
    UiGenerationSSEService,
    UiUtilsService,
    SSEService,
    ProjectSchemaCacheService,
    UisService,
    VersionsService,
  ],
})
export class CoreModule {}