import { Module } from '@nestjs/common';
import { UiListService } from './ui_list.service';
import { DrizzleModule } from 'drizzle/drizzle.module';

@Module({
	imports: [DrizzleModule],
	providers: [UiListService],
	exports: [UiListService],
})
export class UiListModule {}
