import { RDCRoleType } from 'agora-rdc-core';
import axios, { AxiosResponse } from 'axios';

declare const API_HOST: string;

export interface JoinSessionParams {
  channel: string;
  name: string;
  role: RDCRoleType;
}

export interface JoinedSession {
  userId: number;
}

export interface Profile {
  userId: string;
  screenStreamId: number;
  cameraStreamId: number;
  name: string;
  rdcRole: RDCRoleType;
}

export interface Session extends Profile {
  appId: string;
  channel: string;
  userToken: string;
  screenStreamToken: string;
  cameraStreamToken: string;
  expiredAt: number;
}

export const joinSession = (prams: JoinSessionParams) =>
  axios.post<JoinSessionParams, AxiosResponse<JoinedSession>>(`${API_HOST}/api/session`, prams);

export const fetchSession = (userId: string) => axios.get<Session>(`${API_HOST}/api/session/${userId}`);

export const fetchProfiles = (userId: string) => axios.get<Profile[]>(`${API_HOST}/api/session/${userId}/profiles`);
