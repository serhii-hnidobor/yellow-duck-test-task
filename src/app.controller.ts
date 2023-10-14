import { Controller, Head, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

@Controller('health')
export class AppController {
  constructor(private health: HealthCheckService) {}
  @Head()
  @HealthCheck()
  checkHealth() {
    return this.health.check([]);
  }

  @Get()
  getHealth() {
    return this.health.check([]);
  }
}
