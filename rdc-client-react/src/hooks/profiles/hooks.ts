import AgoraRtcEngine from 'agora-electron-sdk';
import { IAgoraRTCClient, IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';
import { useContext, useEffect } from 'react';
import { useEngines } from '../engines';
import { ProfilesContext } from './context';

export const useProfiles = () => {
  const profiles = useContext(ProfilesContext);
  return profiles;
};

export const useUserLeft = (onUserLeft: (userId: string) => void) => {
  const { rtcEngine, rtcEngineType } = useEngines();
  const profiles = useProfiles();
  useEffect(() => {
    if (!rtcEngine) {
      return;
    }
    const handleStreamLeft = (streamIdentifier: number | IAgoraRTCRemoteUser, screenStreamId?: number) => {
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
      // handle for agora-electron-sdk >= 3.6.205
      if (typeof streamIdentifier === 'object' && typeof screenStreamId === 'number') {
        streamId = screenStreamId;
      }
      const userId = profiles.find((p) => p.screenStreamId === streamId)?.userId;
      if (!userId) {
        return;
      }
      onUserLeft(userId);
    };

    if (rtcEngineType === 'electron' && rtcEngine instanceof AgoraRtcEngine) {
      rtcEngine.on('removeStream', handleStreamLeft);
    }
    if (rtcEngineType === 'web') {
      (rtcEngine as IAgoraRTCClient).on('user-left', handleStreamLeft);
    }
    return () => {
      if (rtcEngineType === 'electron' && rtcEngine instanceof AgoraRtcEngine) {
        rtcEngine.off('removeStream', handleStreamLeft);
      }
      if (rtcEngineType === 'web') {
        (rtcEngine as IAgoraRTCClient).off('user-left', handleStreamLeft);
      }
    };
  }, [rtcEngine, profiles, onUserLeft, rtcEngineType]);
};
