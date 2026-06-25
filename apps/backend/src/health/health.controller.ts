import { Controller, Get } from '@nestjs/common';
import type { components } from '../api/schema';

type HealthStatus = components['schemas']['HealthStatus'];

@Controller('healthz')
export class HealthController {
  @Get()
  check(): HealthStatus {
    return { status: 'ok' };
  }
}
