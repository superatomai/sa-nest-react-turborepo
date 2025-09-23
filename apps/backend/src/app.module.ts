import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UiDataService } from './services/ui-data.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { ProjectsModule } from './projects/projects.module';
import { TrpcSSEService } from './trpc/trpc-sse.service';
import { TrpcModule } from './trpc/trpc-module';
import { UiListModule } from './ui_list/ui_list.module';
import { DocsModule } from './docs/docs.module';
import { CoreModule } from './core/core.module';
import { UisModule } from './uis/uis.module';
import { ProjectKeysModule } from './project_keys/project_keys.module';
import { DesignSystemModule } from './design_system/design_system.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { DeploymentController } from './controllers/deployment.controller';
import { DeploymentService } from './services/deployment.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CoreModule,
    AuthModule,
    DrizzleModule,
    ProjectsModule,
    UisModule,
    UiListModule,
    DocsModule,
    ProjectKeysModule,
    DesignSystemModule,
    WebhooksModule,
    TrpcModule
  ],
  controllers: [AppController, DeploymentController],
  providers: [
    AppService,
    UiDataService,
    TrpcSSEService,
    DeploymentService,
  ],
})
export class AppModule {}