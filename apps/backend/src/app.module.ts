import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { Module, type DynamicModule } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { StoreModule } from './store/store.module';
import { EventTypesModule } from './event-types/event-types.module';
import { AvailabilityModule } from './availability/availability.module';
import { BookingsModule } from './bookings/bookings.module';

// In production the built React SPA is served from the same origin as the API
// (single container, single PORT). We only register the static handler when the
// build actually exists, so local dev and the Jest e2e suite — which expect the
// API at the root paths and have no SPA build — are unaffected.
const frontendDist =
  process.env.FRONTEND_DIST ?? join(__dirname, '..', '..', 'frontend', 'dist');

const staticImports: DynamicModule[] = existsSync(frontendDist)
  ? [
      ServeStaticModule.forRoot({
        rootPath: frontendDist,
        // Keep the contract's API routes returning JSON instead of index.html.
        exclude: [
          '/event-types',
          '/event-types/{*splat}',
          '/availability',
          '/availability/{*splat}',
          '/bookings',
          '/bookings/{*splat}',
        ],
      }),
    ]
  : [];

@Module({
  imports: [
    ...staticImports,
    StoreModule,
    EventTypesModule,
    AvailabilityModule,
    BookingsModule,
  ],
})
export class AppModule {}
