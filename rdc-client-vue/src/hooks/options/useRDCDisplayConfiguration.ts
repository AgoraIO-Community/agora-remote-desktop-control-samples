import { reactive } from 'vue';
import { RDCDisplayConfiguration } from 'agora-rdc-core';
import { ControlledOptions } from '../../interfaces';
import { RESOLUTION_BITRATE } from '../../constants';
import { useOptions } from './useOptions';


export const useRDCDisplayConfiguration = (): Partial<RDCDisplayConfiguration> => {
  const { resolutionBitrate, frameRate } = useOptions<ControlledOptions>();
  const configuration = reactive<Partial<RDCDisplayConfiguration>>({ frameRate });
  if (resolutionBitrate) {
    const { width, height, bitrate } = RESOLUTION_BITRATE[resolutionBitrate];
    configuration.width = width;
    configuration.height = height;
    configuration.bitrate = bitrate;
  }
  return configuration;
};
