import { Injectable, NgModule } from '@angular/core';
import { RDCRoleType } from 'agora-rdc-core';
import { AgoraRemoteDesktopControl as RDCEngineWithElectronRTC } from 'agora-rdc-electron';
import { AgoraRemoteDesktopControl as RDCEngineWithWebRTC } from 'agora-rdc-webrtc-electron';
import AgoraRtcEngine from 'agora-electron-sdk';
import AgoraRTC, { IAgoraRTCClient } from 'agora-rtc-sdk-ng';
import { mergeMap, Subject, forkJoin, Observable } from 'rxjs';
import { APIService, Session } from '../api/api.service';
import { Options } from '../../interfaces';
import { ParametersService } from '../parameters/parameters.service';

export type RTCEngine = AgoraRtcEngine | IAgoraRTCClient;

export type RDCEngine = RDCEngineWithElectronRTC | RDCEngineWithWebRTC;

const isMacOS = navigator.userAgent.toLowerCase().indexOf('mac') >= 0;

const LOGS_FOLDER = isMacOS ? `${window.process.env['HOME']}/Library/Logs/RDCClient` : '.';

@Injectable({
  providedIn: 'root',
})
@NgModule()
export class EnginesService {
  get rtcEngine(): Observable<RTCEngine> {
    return this.rtcEngineSubject.asObservable();
  }

  get rdcEngine(): Observable<RDCEngine> {
    return this.rdcEngineSubject.asObservable();
  }

  private rtcEngineSubject: Subject<RTCEngine> = new Subject();
  private rdcEngineSubject: Subject<RDCEngine> = new Subject();

  constructor() {}

  ignite(
    session: Session,
    options: Options,
  ): {
    rtcEngine: Observable<RTCEngine>;
    rdcEngine: Observable<RDCEngine>;
  } {
    const {
      appId,
      rdcRole,
      userId,
      userToken,
      channel,
      screenStreamId,
      screenStreamToken,
      cameraStreamToken,
      cameraStreamId,
    } = session;
    const { rtcEngineType, ...resetOpts } = options;
    let rtcEngine: RTCEngine | null = null;
    let rdcEngine: RDCEngine | null = null;
    if (rtcEngineType === 'electron') {
      rtcEngine = new AgoraRtcEngine();
      rtcEngine.initialize(appId, 1, {
        filePath: `${LOGS_FOLDER}/agora_rtc_sdk.log`,
        level: 1,
        fileSizeInKB: 2048,
      });

      rdcEngine = RDCEngineWithElectronRTC.create(rtcEngine, {
        role: rdcRole,
        appId,
        ...resetOpts,
      });
    }

    if (rtcEngineType === 'web') {
      rtcEngine = AgoraRTC.createClient({ role: 'host', mode: 'rtc', codec: 'av1' });
      this.rtcEngineSubject.next(rtcEngine);

      rdcEngine = RDCEngineWithWebRTC.create(rtcEngine, {
        role: rdcRole,
        appId,
        ...resetOpts,
      });
    }

    if (rdcEngine) {
      this.rdcEngineSubject.next(rdcEngine);
      this.rdcEngineSubject.complete();
      debugger;
    }

    if (rtcEngine) {
      this.rtcEngineSubject.next(rtcEngine);
      this.rtcEngineSubject.complete();
    }

    if (rdcEngine) {
      rdcEngine.join(userId, userToken, channel, screenStreamId, screenStreamToken);
    }
    if (rtcEngine && rdcEngine && rtcEngineType === 'electron' && rtcEngine instanceof AgoraRtcEngine) {
      rtcEngine.setChannelProfile(0);
      rtcEngine.setClientRole(1);
      rtcEngine.enableVideo();
      rtcEngine.enableAudio();
      rtcEngine.enableLocalAudio(rdcEngine.getRole() === RDCRoleType.CONTROLLED ? true : false);
      rtcEngine.enableLocalVideo(false);
      rtcEngine.joinChannel(cameraStreamToken, channel, '', cameraStreamId);
    }

    return {
      rtcEngine: this.rtcEngine,
      rdcEngine: this.rdcEngine,
    };
  }
}
