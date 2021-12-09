import { AgoraRemoteDesktopControl as RDCEngineWithElectronRTC } from 'agora-rdc-electron';
import { AgoraRemoteDesktopControl as RDCEngineWithWebRTC } from 'agora-rdc-webrtc-electron';
import AgoraRtcEngine from 'agora-electron-sdk';
import { IAgoraRTCClient } from 'agora-rtc-sdk-ng';
import { Session } from '../../api';

export type RTCEngine = AgoraRtcEngine | IAgoraRTCClient;

export type RDCEngine = RDCEngineWithElectronRTC | RDCEngineWithWebRTC;

export type RTCEngineType = 'web' | 'electron';

export interface EnginesParams extends Session {
  logsFolder: string;
}

export interface Engines {
  rtcEngine: RTCEngine;
  rdcEngine: RDCEngine;
}