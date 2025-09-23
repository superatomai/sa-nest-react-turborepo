import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { ProjectsModule } from '../projects/projects.module';
import { UisModule } from '../uis/uis.module';
import { DesignSystemModule } from '../design_system/design_system.module';

@Module({
  imports: [ProjectsModule, UisModule, DesignSystemModule],
  controllers: [WebhooksController],
  providers: [WebhooksService],
  exports: [WebhooksService],
})
export class WebhooksModule {}