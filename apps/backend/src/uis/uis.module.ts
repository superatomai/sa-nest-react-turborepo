import { Module } from '@nestjs/common';
import { UisService } from './uis.service';
import { VersionsService } from './versions.service';
import { DrizzleModule } from '../../drizzle/drizzle.module';

@Module({
  imports: [DrizzleModule],
  providers: [UisService, VersionsService],
  exports: [UisService, VersionsService],
})
export class UisModule {}