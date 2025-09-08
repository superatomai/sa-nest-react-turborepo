import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LlmService } from './services/llm.service';
import { WebSocketManagerService } from './services/websocket-manager.service';
import { UiGenerationService } from './services/ui-generation.service';
import { ProjectSchemaCacheService } from './services/project-schema-cache.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { ProjectsModule } from './projects/projects.module';
import { UisModule } from './uis/uis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    DrizzleModule,
    ProjectsModule,
    UisModule,
  ],
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