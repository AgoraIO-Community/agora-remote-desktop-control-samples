import { RTCEngineType } from '../engines';
import { useOptions } from './useOptions';


export const useRDCEngineType = (): RTCEngineType => {
  const options = useOptions();
  return options.rtcEngineType;
};
