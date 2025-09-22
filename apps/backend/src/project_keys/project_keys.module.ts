// apps/backend/src/projects/projects.module.ts
import { Module } from '@nestjs/common';
import { DrizzleModule } from '../../drizzle/drizzle.module';
import { ProjectKeysService } from './project_keys.service';

@Module({
  imports: [DrizzleModule],
  providers: [ProjectKeysService],
  exports: [ProjectKeysService], 
})
export class ProjectKeysModule {}
