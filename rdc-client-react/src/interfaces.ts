import { RDCThresholdOptions } from 'agora-rdc-core';
import { RTCEngineType } from './hooks/engines';

export interface Options {
  rtcEngineType: RTCEngineType;
}

export type HostOptions = Options & RDCThresholdOptions;

export interface ControlledOptions extends Options {
  resolutionBitrate: string;
  frameRate: number;
}
