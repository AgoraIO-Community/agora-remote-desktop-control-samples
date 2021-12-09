import { reactive } from 'vue';
import { RDCThresholdOptions } from 'agora-rdc-core';
import { HostOptions } from '../../interfaces';
import { useOptions } from './useOptions';


export const useRDCThresholdOptions = (): RDCThresholdOptions => {
  const { mouseEventsThreshold, keyboardEventsThreshold } = useOptions<HostOptions>();
  const options = reactive({ mouseEventsThreshold, keyboardEventsThreshold });
  return options;
};
