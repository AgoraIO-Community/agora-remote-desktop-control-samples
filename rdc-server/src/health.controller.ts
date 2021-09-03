import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('/healthz')
  async health() {
    return 'OK';
  }

  @Get('/readz')
  async read() {
    return 'OK';
  }
}
