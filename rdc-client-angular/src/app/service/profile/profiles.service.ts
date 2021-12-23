import { Injectable, NgModule } from '@angular/core';
import { IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';
import { Subject, Observable, firstValueFrom, lastValueFrom } from 'rxjs';
import { ControlledOptions, HostOptions, Options } from '../../interfaces';
import { APIService, Profile } from '../api/api.service';
import { EnginesService, RTCEngine } from '../engines/engines.service';

@Injectable({
  providedIn: 'root',
})
@NgModule()
export class ProfilesService {
  private profilesSubject: Subject<Profile[]> = new Subject();
  private streamIdsJoinedSubject: Subject<number[]> = new Subject();
  private streamIds: number[] = [];

  get profiles(): Observable<Profile[]> {
    return this.profilesSubject.asObservable();
  }

  constructor(private engines: EnginesService, private api: APIService) {}

  subscribe(userId: string, options: HostOptions | ControlledOptions) {
    this.engines.rtcEngine.subscribe((rtcEngine) => {
      this.bindEvents(rtcEngine, options);
    });
    this.streamIdsJoinedSubject.subscribe(async (streamIds) => {
      const profiles = await lastValueFrom(this.api.fetchProfiles(userId));
      this.profilesSubject.next(profiles.filter((profile) => streamIds.includes(profile.screenStreamId)));
    });
  }

  private bindEvents(rtcEngine: RTCEngine, options: Options) {
    if (options.rtcEngineType === 'electron') {
      rtcEngine.on('userJoined', this.handleStreamJoined);
      rtcEngine.on('removeStream', this.handleStreamLeft);
    }

    if (options.rtcEngineType === 'web') {
      rtcEngine.on('user-joined', this.handleStreamJoined);
      rtcEngine.on('user-left', this.handleStreamLeft);
    }
  }

  private handleStreamJoined = (streamIdentifier: number | IAgoraRTCRemoteUser, screenStreamId?: number) => {
    const streamId = this.getStreamId(streamIdentifier, screenStreamId);
    if (!streamId) {
      return;
    }
    this.streamIds = [...this.streamIds, streamId];
    this.streamIdsJoinedSubject.next(this.streamIds);
  };

  private handleStreamLeft = (streamIdentifier: number | IAgoraRTCRemoteUser, screenStreamId?: number) => {
    const streamId = this.getStreamId(streamIdentifier, screenStreamId);
    if (!streamId) {
      return;
    }
    this.streamIds = this.streamIds.filter((id) => id !== streamId);
    this.streamIdsJoinedSubject.next(this.streamIds);
  };

  private getStreamId(streamIdentifier: number | IAgoraRTCRemoteUser, screenStreamId?: number) {
    let streamId: number | undefined;
    // handle for agora-rtc-sdk-ng;
    if (typeof streamIdentifier === 'number') {
      streamId = streamIdentifier;
    }
    // handle for agora-electron-sdk <= 3.5.1 && >= 2.8.0
    if (typeof streamIdentifier === 'object' && typeof screenStreamId === 'undefined') {
      const remoteUser = streamIdentifier as IAgoraRTCRemoteUser;
      streamId = remoteUser.uid as number;
    }
    // handle for agora-electron-sdk >= 3.6.0
    if (typeof streamIdentifier === 'object' && typeof screenStreamId === 'number') {
      streamId = screenStreamId;
    }
    return streamId;
  }
}
