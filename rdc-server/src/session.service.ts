import { Injectable } from '@nestjs/common';
import { RtcTokenBuilder, RtcRole, RtmRole, RtmTokenBuilder } from 'agora-access-token';
import { RedisService } from 'nestjs-redis';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { v1 as uuid } from 'uuid';

export enum RDCRoleType {
  /**
   * Host end
   */
  HOST = 1,
  /**
   * Controlled end
   */
  CONTROLLED = 2,
}

export interface Profile {
  userId: string;
  screenStreamId: number;
  cameraStreamId: number;
  name: string;
  rdcRole: RDCRoleType;
}

export interface SessionDTO extends Profile {
  appId: string;
  channel: string;
  userToken: string;
  screenStreamToken: string;
  cameraStreamToken: string;
  expiredAt: number;
}

export const ETA = 60 * 60 * 24;

@Injectable()
export class SessionService {
  constructor(private readonly configService: ConfigService, private readonly redisService: RedisService) {}

  async joinSession(channel: string, role: RDCRoleType, name: string): Promise<string> {
    const client = await this.redisService.getClient();

    const isChannelExist = await client.exists(`c:${channel}:c`);
    Logger.debug(`channel: ${channel} is exist: ${isChannelExist}.`);
    if (!isChannelExist) {
      const expiredAt = Date.now() / 1000 + ETA;
      // channle:${channel}:channel
      await client.set(`c:${channel}:c`, channel, 'ex', ETA);
      // channle:${channel}:expiredAt
      await client.set(`c:${channel}:ea`, expiredAt, 'ex', ETA);
    }
    const expiredAt = Number(await client.get(`c:${channel}:ea`));

    const userId = this.buildUserId(channel);
    const userToken = this.buildUserToken(userId, expiredAt);

    const screenStreamId = this.buildStreamId();
    const screenStreamToken = this.buildStreamToken(channel, screenStreamId, expiredAt);

    const cameraStreamId = this.buildStreamId();
    const cameraStreamToken = this.buildStreamToken(channel, cameraStreamId, expiredAt);

    // user:${userId}:channel
    await client.set(`u:${userId}:c`, channel, 'ex', ETA);
    // user:${userId}:role
    await client.set(`u:${userId}:r`, role, 'ex', ETA);
    // user:${userId}:name
    await client.set(`u:${userId}:n`, name, 'ex', ETA);

    // user:${userId}:userId
    await client.set(`u:${userId}:uid`, userId, 'ex', ETA);
    // user:${userId}:userToken;
    await client.set(`u:${userId}:ut`, userToken, 'ex', ETA);

    // user:${userId}:screenStreamId
    await client.set(`u:${userId}:ssid`, screenStreamId, 'ex', ETA);
    // user:${userId}:screenStreamToken;
    await client.set(`u:${userId}:sst`, screenStreamToken, 'ex', ETA);

    // user:${userId}:cameraStreamId
    await client.set(`u:${userId}:csid`, cameraStreamId, 'ex', ETA);
    // user:${userId}:screenStreamToken;
    await client.set(`u:${userId}:cst`, cameraStreamToken, 'ex', ETA);

    const sLength = await client.scard(`c:${channel}:uids`);
    if (sLength === 0) {
      await client.expire(`c:${channel}:uids`, ETA);
      Logger.log(`expire key: '${`c:${channel}:uids`}' at: ${ETA}`);
    }

    await client.sadd(`c:${channel}:uids`, userId, 'ex', ETA);

    return userId;
  }

  async getSession(userId: string): Promise<SessionDTO> {
    const client = await this.redisService.getClient();

    const channel = await client.get(`u:${userId}:c`);

    const expiredAt = await client.get(`c:${channel}:ea`);

    const name = await client.get(`u:${userId}:n`);
    const rdcRole = Number(await client.get(`u:${userId}:r`));

    const userToken = await client.get(`u:${userId}:ut`);

    const screenStreamId = Number(await client.get(`u:${userId}:ssid`));
    const screenStreamToken = await client.get(`u:${userId}:sst`);

    const cameraStreamId = Number(await client.get(`u:${userId}:csid`));
    const cameraStreamToken = await client.get(`u:${userId}:cst`);

    return {
      userId,
      screenStreamId,
      cameraStreamId,
      name,
      rdcRole,
      appId: this.configService.get('AGORA_APP_ID'),
      channel,
      userToken,
      screenStreamToken,
      cameraStreamToken,
      expiredAt: Number(expiredAt),
    };
  }

  async getProfiles(userId: string): Promise<Profile[]> {
    const client = await this.redisService.getClient();

    const channel = await client.get(`u:${userId}:c`);
    const userIds = await client.smembers(`c:${channel}:uids`);

    return await Promise.all(userIds.map((uid) => this.getProfile(uid)));
  }

  async getProfile(userId): Promise<Profile> {
    const client = await this.redisService.getClient();

    const cameraStreamId = Number(await client.get(`u:${userId}:`));
    const screenStreamId = Number(await client.get(`u:${userId}:`));
    const name = await client.get(`u:${userId}:n`);
    const rdcRole = Number(await client.get(`u:${userId}:r`));

    return {
      userId,
      cameraStreamId,
      screenStreamId,
      name,
      rdcRole,
    };
  }

  private buildStreamToken(channel: string, streamId: number, expiredAt: number) {
    return RtcTokenBuilder.buildTokenWithUid(
      this.configService.get('AGORA_APP_ID'),
      this.configService.get('AGORA_APP_CERTIFICATE'),
      channel,
      streamId,
      RtcRole.PUBLISHER,
      expiredAt,
    );
  }

  private buildUserToken(userId: string, expiredAt: number) {
    return RtmTokenBuilder.buildToken(
      this.configService.get('AGORA_APP_ID'),
      this.configService.get('AGORA_APP_CERTIFICATE'),
      userId,
      RtmRole.Rtm_User,
      expiredAt,
    );
  }

  private buildUserId(channel: string): string {
    return `${channel}-${uuid()}`;
  }

  private buildStreamId(): number {
    return Math.floor(10000 + Math.random() * 90000);
  }
}
