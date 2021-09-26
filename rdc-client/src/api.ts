import axios from 'axios';
import { RDCRoleType } from 'agora-rdc-core';

declare const API_HOST: string;

export interface JoinSession {
  uid: number;
}

export interface RTCAuthorization {
  uid: number;
  token: string;
}

export interface RDCAuthorization {
  uid: number;
  tokens: {
    rtc: string;
    rtm: string;
  };
}
export interface Session {
  channel: string;
  username: string;
  appId: string;
  expiredAt: number;
  rtc: RTCAuthorization;
  rdc: RDCAuthorization;
}

export const joinSession = (channel: string, role: RDCRoleType) =>
  axios.post<JoinSession>(`${API_HOST}/api/session`, {
    channel,
    role,
  });

export const fetchSession = (uid: string) => axios.get<Session>(`${API_HOST}/api/session/${uid}`);
