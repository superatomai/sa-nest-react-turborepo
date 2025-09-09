import { Module } from '@nestjs/common';
import { TrpcService } from './trpc.service';
import { TrpcSSEService } from './trpc-sse.service';
import { UiGenerationService } from '../services/ui-generation.service';
import { UiGenerationSSEService } from '../services/ui-generation-sse.service';
import { SSEService } from '../services/sse.service';
import { LlmService } from 'src/services/llm.service';
import { WebSocketManagerService } from 'src/services/websocket-manager.service';
import { ProjectSchemaCacheService } from 'src/services/project-schema-cache.service';
import { UiUtilsService } from 'src/services/ui-utils.service';
import { UisService } from 'src/uis/uis.service';
import { VersionsService } from 'src/uis/versions.service';
import { DrizzleService } from 'drizzle/drizzle.service';
@Module({
  providers: [
    TrpcService,
    TrpcSSEService,
    UiGenerationService,
    UiGenerationSSEService,
    SSEService,
    LlmService,
    WebSocketManagerService,
    ProjectSchemaCacheService, // dependency of LlmService
    UiUtilsService,
    UisService,
    VersionsService,
    DrizzleService,           // dependency of UisService & VersionsService
  ],
  exports: [TrpcService, TrpcSSEService],
})
export class TrpcModule {}
