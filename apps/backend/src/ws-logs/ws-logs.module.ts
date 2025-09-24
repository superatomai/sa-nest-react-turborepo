import { Module } from '@nestjs/common';
import { WsLogsService } from './ws-logs.service';
import { DrizzleModule } from '../../drizzle/drizzle.module';

@Module({
  imports: [DrizzleModule],
  providers: [WsLogsService],
  exports: [WsLogsService],
})
export class WsLogsModule {}