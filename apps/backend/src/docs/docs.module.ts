// apps/backend/src/projects/projects.module.ts
import { Module } from '@nestjs/common';
import { DrizzleModule } from '../../drizzle/drizzle.module';
import { DocsService } from './docs.service';

@Module({
  imports: [DrizzleModule],
  providers: [DocsService],
  exports: [DocsService], 
})
export class DocsModule {}
