import { Module } from '@nestjs/common';
import { TrpcService } from './trpc.service';
import { TrpcSSEService } from './trpc-sse.service';

@Module({
  providers: [
    TrpcService,
    TrpcSSEService,
  ],
  exports: [TrpcService, TrpcSSEService],
})
export class TrpcModule {}
