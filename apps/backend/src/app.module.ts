import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LlmService } from './services/llm.service';
import { WebSocketManagerService } from './services/websocket-manager.service';
import { UiGenerationService } from './services/ui-generation.service';
import { UiGenerationSSEService } from './services/ui-generation-sse.service';
import { UiDataService } from './services/ui-data.service';
import { UiUtilsService } from './services/ui-utils.service';
import { SSEService } from './services/sse.service';
import { ProjectSchemaCacheService } from './services/project-schema-cache.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { ProjectsModule } from './projects/projects.module';
import { UisModule } from './uis/uis.module';
import { TrpcSSEService } from './trpc/trpc-sse.service';
import tr from 'zod/v4/locales/tr.cjs';
import { TrpcModule } from './trpc/trpc-module';
import { UiListModule } from './ui_list/ui_list.module';
import { DocsModule } from './docs/docs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    DrizzleModule,
    ProjectsModule,
    UisModule,
    UiListModule,
    DocsModule,
    TrpcModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    LlmService,
    WebSocketManagerService,
    UiGenerationService,
    UiGenerationSSEService,
    UiDataService,
    UiUtilsService,
    SSEService,
    TrpcSSEService,
    ProjectSchemaCacheService,
  ],
})
export class AppModule {}