import { RDCDisplayConfiguration, RDCThresholdOptions } from 'agora-rdc-core';
import qs from 'querystring';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { RESOLUTION_BITRATE } from '../../constants';
import { ControlledOptions, HostOptions, Options } from '../../interfaces';
import { RTCEngineType } from '../engines';

export const useOptions = <T>(): T => {
  const location = useLocation();
  const { opts } = qs.parse(location.search.replace('?', '')) as { opts: string };
  const options: T = useMemo(() => (opts ? JSON.parse(atob(opts)) : {}), [opts]);
  return options;
};

export const useRDCEngineType = (): RTCEngineType => {
  const { rtcEngineType }: Options = useOptions();
  return rtcEngineType;
};

export const useRDCThresholdOptions = (): RDCThresholdOptions => {
  const { mouseEventsThreshold, keyboardEventsThreshold }: HostOptions = useOptions();
  return { mouseEventsThreshold, keyboardEventsThreshold };
};

export const useRDCDisplayConfiguration = (): Partial<RDCDisplayConfiguration> => {
  const options: ControlledOptions = useOptions();
  const { resolutionBitrate, frameRate } = options;
  const rdcDisplayConfiguration: Partial<RDCDisplayConfiguration> = { frameRate };
  if (resolutionBitrate) {
    const { width, height, bitrate } = RESOLUTION_BITRATE[resolutionBitrate];
    rdcDisplayConfiguration.width = width;
    rdcDisplayConfiguration.height = height;
    rdcDisplayConfiguration.bitrate = bitrate;
  }
  return rdcDisplayConfiguration;
};
