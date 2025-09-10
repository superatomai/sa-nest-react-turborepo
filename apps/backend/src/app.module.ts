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
import { CoreModule } from './core/core.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CoreModule,
    AuthModule,
    DrizzleModule,
    ProjectsModule,
    TrpcModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    UiDataService,
    TrpcSSEService,
  ],
})
export class AppModule {}