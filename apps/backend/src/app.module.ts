import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LlmService } from './services/llm.service';
import { WebSocketManagerService } from './services/websocket-manager.service';
import { UiGenerationService } from './services/ui-generation.service';
import { ProjectSchemaCacheService } from './services/project-schema-cache.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    LlmService,
    WebSocketManagerService,
    UiGenerationService,
    ProjectSchemaCacheService,
  ],
})
export class AppModule {}
