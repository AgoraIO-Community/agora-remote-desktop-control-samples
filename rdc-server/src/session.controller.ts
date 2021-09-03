import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { SessionService, RoleType } from './session.service';

export class CreateSessionParams {
  channel: string;
  role: RoleType;
}

@Controller('/session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  async joinSession(@Body() { channel, role }: CreateSessionParams) {
    return {
      uid: await this.sessionService.joinSession(channel, role),
    };
  }

  @Get('/:uid')
  async getSession(@Param('uid') uid: string) {
    return this.sessionService.getSession(parseInt(uid));
  }
}
