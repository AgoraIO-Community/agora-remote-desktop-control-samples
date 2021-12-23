import { RDCThresholdOptions } from 'agora-rdc-core';

export type RTCEngineType = 'web' | 'electron';

export interface Options {
  rtcEngineType: RTCEngineType;
}

export type HostOptions = Options & RDCThresholdOptions;

export interface ControlledOptions extends Options {
  resolutionBitrate: string;
  frameRate: number;
}
