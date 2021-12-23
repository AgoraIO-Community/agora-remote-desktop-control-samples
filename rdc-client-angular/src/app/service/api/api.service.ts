import { HttpClient } from '@angular/common/http';
import { Injectable, NgModule } from '@angular/core';
import { RDCRoleType } from 'agora-rdc-core';
import { environment } from '../../../environments/environment';

const API_HOST = environment.apiHost;

export interface JoinSessionParams {
  channel: string;
  name: string;
  role: RDCRoleType;
}

export interface JoinedSession {
  userId: string;
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

@Injectable({
  providedIn: 'root',
})
@NgModule()
export class APIService {
  constructor(private httpClient: HttpClient) {}

  joinSession(params: JoinSessionParams) {
    return this.httpClient.post<JoinedSession>(`${API_HOST}/api/session`, params);
  }

  fetchSession(userId: string) {
    return this.httpClient.get<Session>(`${API_HOST}/api/session/${userId}`);
  }

  fetchProfiles(userId: string) {
    return this.httpClient.get<Profile[]>(`${API_HOST}/api/session/${userId}/profiles`);
  }
}
