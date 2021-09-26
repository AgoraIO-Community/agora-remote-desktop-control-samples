export interface Options {
  rtcSDK: 'web' | 'electron';
}

export interface HostOptions extends Options {
  mouseEventsThreshold: number;
  keyboardEventsThreshold: number;
}

export interface ControlledOptions extends Options {
  resolutionBitrate: string;
  frameRate: number;
}
