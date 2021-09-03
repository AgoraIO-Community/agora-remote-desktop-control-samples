import { Injectable } from '@nestjs/common';
import { RtcTokenBuilder, RtcRole, RtmRole, RtmTokenBuilder } from 'agora-access-token';
import { RedisService } from 'nestjs-redis';
import md5 = require('js-md5');
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

export enum RoleType {
  /**
   * Host end
   */
  HOST = 1,
  /**
   * Controlled end
   */
  CONTROLLED = 2,
}

export enum StreamType {
  CAMERA = 1,
  SCREEN = 2,
  FULL_SCREEN = 3,
}

export interface RTCAuthorization {
  uid: number;
  token: string;
}

export interface RDCAuthorization {
  uid: number;
  tokens: {
    rtc: string;
    rtm: string;
  };
}

export interface SessionDTO {
  channel: string;
  appId: string;
  expiredAt: number;
  rtc: RTCAuthorization;
  rdc: RDCAuthorization;
}

export const ETA = 60 * 60 * 24;

@Injectable()
export class SessionService {
  constructor(private readonly configService: ConfigService, private readonly redisService: RedisService) {}

  async joinSession(channel: string, role: RoleType): Promise<number> {
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

    const rawuid = this.buildUid();

    const uid = Number(`${StreamType.CAMERA}${role}${rawuid}`);
    const token = this.buildRTCToken(channel, uid, expiredAt);

    const rdcUid = Number(`${StreamType.FULL_SCREEN}${role}${rawuid}`);
    const rdcRtcToken = this.buildRTCToken(channel, rdcUid, expiredAt);
    const rdcRtmToken = this.buildRTMToken(rdcUid.toString(), expiredAt);
    // user:${uid}:channel
    await client.set(`u:${uid}:c`, channel, 'ex', ETA);
    // user:${uid}:uid
    await client.set(`u:${uid}:uid`, uid, 'ex', ETA);
    // user:${uid}:token;
    await client.set(`u:${uid}:t`, token, 'ex', ETA);
    // user:${uid}:rdcUid
    await client.set(`u:${uid}:ruid`, rdcUid, 'ex', ETA);
    // user:${uid}:rdcRtcToken;
    await client.set(`u:${uid}:rrtct`, rdcRtcToken, 'ex', ETA);
    // user:${uid}:rdcRtmToken;
    await client.set(`u:${uid}:rrtmt`, rdcRtmToken, 'ex', ETA);

    return uid;
  }

  async getSession(uid: number): Promise<SessionDTO> {
    const client = await this.redisService.getClient();

    const token = await client.get(`u:${uid}:t`);

    const channel = await client.get(`u:${uid}:c`);
    const expiredAt = await client.get(`c:${channel}:ea`);

    const rdcUid = Number(await client.get(`u:${uid}:ruid`));
    const rdcRtcToken = await client.get(`u:${uid}:rrtct`);
    const rdcRtmToken = await client.get(`u:${uid}:rrtmt`);

    return {
      appId: this.configService.get('AGORA_APP_ID'),
      channel,
      expiredAt: Number(expiredAt),
      rtc: {
        uid,
        token,
      },
      rdc: {
        uid: rdcUid,
        tokens: {
          rtc: rdcRtcToken,
          rtm: rdcRtmToken,
        },
      },
    };
  }

  private buildRTCToken(channel: string, uid: number, expiredAt: number) {
    return RtcTokenBuilder.buildTokenWithUid(
      this.configService.get('AGORA_APP_ID'),
      this.configService.get('AGORA_APP_CERTIFICATE'),
      channel,
      uid,
      RtcRole.PUBLISHER,
      expiredAt,
    );
  }

  private buildRTMToken(uid: string, expiredAt: number) {
    return RtmTokenBuilder.buildToken(
      this.configService.get('AGORA_APP_ID'),
      this.configService.get('AGORA_APP_CERTIFICATE'),
      uid,
      RtmRole.Rtm_User,
      expiredAt,
    );
  }

  private buildUid(): number {
    return Math.floor(10000 + Math.random() * 90000);
  }
}
