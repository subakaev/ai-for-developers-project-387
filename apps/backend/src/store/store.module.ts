import { Global, Module } from '@nestjs/common';
import { StoreService } from './store.service';

/** Global so every feature shares the same in-memory store instance. */
@Global()
@Module({
  providers: [StoreService],
  exports: [StoreService],
})
export class StoreModule {}
