import { Module } from '@nestjs/common';
import { DesignSystemService } from './design_system.service';
import { DrizzleModule } from '../../drizzle/drizzle.module';

@Module({
  imports: [DrizzleModule],
  providers: [DesignSystemService],
  exports: [DesignSystemService],
})
export class DesignSystemModule {}