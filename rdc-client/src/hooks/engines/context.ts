import { createContext } from 'react';
import { RTCEngine, RDCEngine, RTCEngineType } from './interface';

export interface Engines {
  rtcEngine?: RTCEngine;
  rdcEngine?: RDCEngine;
  rtcEngineType?: RTCEngineType;
}

export const EnginesContext = createContext<Engines>({});
