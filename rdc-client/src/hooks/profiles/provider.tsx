import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import AgoraRtcEngine from 'agora-electron-sdk';
import { IAgoraRTCClient, IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';
import { useEngines } from '../engines';
import { fetchProfiles } from '../../api';
import { ProfilesContext } from './context';
import { useSession } from '../session';

export interface ProfilesProviderProps {
  userId: string;
}

export const ProfilesProvider: FC<ProfilesProviderProps> = ({ userId, children }) => {
  const { rtcEngine, rtcEngineType } = useEngines();
  const [screenStreamIds, setScreenStreamIds] = useState<number[]>([]);
  const session = useSession();
  const asyncState = useAsync(() => fetchProfiles(userId), [userId, screenStreamIds]);

  const profiles = useMemo(() => asyncState.value?.data ?? [], [asyncState]);
  const value = useMemo(
    () => profiles.filter((profile) => screenStreamIds.includes(profile.screenStreamId)),
    [screenStreamIds, profiles],
  );

  const handleStreamJoined = useCallback(
    (streamIdentifier: number | IAgoraRTCRemoteUser, screenStreamId?: number) => {
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
      if (!streamId || session?.screenStreamId === streamId) {
        return;
      }
      setScreenStreamIds([...screenStreamIds, streamId]);
    },
    [session, screenStreamIds, setScreenStreamIds],
  );

  const handleStreamLeft = useCallback(
    (streamIdentifier: number | IAgoraRTCRemoteUser, screenStreamId?: number) => {
      if (typeof streamIdentifier === 'number') {
        setScreenStreamIds(screenStreamIds.filter((streamId) => streamId === streamIdentifier));
        return;
      }
      // handle for 3.6.205-build.1029
      if (typeof screenStreamId === 'number' && session?.screenStreamId !== screenStreamId) {
        setScreenStreamIds([...screenStreamIds, screenStreamId]);
        return;
      }
      const remoteUser = streamIdentifier as IAgoraRTCRemoteUser;
      setScreenStreamIds(screenStreamIds.filter((streamId) => streamId !== remoteUser.uid));
    },
    [screenStreamIds, setScreenStreamIds],
  );

  useEffect(() => {
    if (!rtcEngine) {
      return;
    }
    if (rtcEngineType === 'electron' && rtcEngine instanceof AgoraRtcEngine) {
      rtcEngine.on('userJoined', handleStreamJoined);
      rtcEngine.on('removeStream', handleStreamLeft);
    }
    if (rtcEngineType === 'web') {
      (rtcEngine as IAgoraRTCClient).on('user-joined', handleStreamJoined);
      (rtcEngine as IAgoraRTCClient).on('user-left', handleStreamLeft);
    }
    return () => {
      if (rtcEngineType === 'electron' && rtcEngine instanceof AgoraRtcEngine) {
        rtcEngine.off('userJoined', handleStreamJoined);
        rtcEngine.off('removeStream', handleStreamLeft);
      }
      if (rtcEngineType === 'web') {
        (rtcEngine as IAgoraRTCClient).off('user-joined', handleStreamJoined);
        (rtcEngine as IAgoraRTCClient).off('user-left', handleStreamLeft);
      }
    };
  }, [rtcEngine, rtcEngineType, handleStreamJoined, handleStreamLeft]);

  return <ProfilesContext.Provider value={value}>{children}</ProfilesContext.Provider>;
};
