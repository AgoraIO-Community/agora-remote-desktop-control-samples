import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { SessionService, RDCRoleType } from './session.service';

export class CreateSessionParams {
  channel: string;
  role: RDCRoleType;
  name: string
}

@Controller('/session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  async joinSession(@Body() { channel, role , name}: CreateSessionParams) {
    return {
      userId: await this.sessionService.joinSession(channel, role, name),
    };
  }

  @Get('/:userId')
  async getSession(@Param('userId') userId: string) {
    return this.sessionService.getSession(userId);
  }

  @Get('/:userId/profiles')
  async getProfiles(@Param('userId') userId: string) {
    return this.sessionService.getProfiles(userId);
  }
}
