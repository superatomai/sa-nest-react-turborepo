// apps/backend/src/projects/projects.module.ts
import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { DrizzleModule } from '../../drizzle/drizzle.module';

@Module({
  imports: [DrizzleModule],
  providers: [ProjectsService],
  exports: [ProjectsService], // 👈 critical so app.get() works
})
export class ProjectsModule {}
