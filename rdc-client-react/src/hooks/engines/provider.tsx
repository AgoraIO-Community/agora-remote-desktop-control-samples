import React, { FC, useEffect, useState } from 'react';
import AgoraRtcEngine from 'agora-electron-sdk';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { AgoraRemoteDesktopControl as RDCEngineWithElectronRTC } from 'agora-rdc-electron';
import { AgoraRemoteDesktopControl as RDCEngineWithWebRTC } from 'agora-rdc-webrtc-electron';
import { RDCRoleType } from 'agora-rdc-core';
import { EnginesContext } from './context';
import { RDCEngine, RTCEngine } from './interface';
import { useRDCEngineType, useRDCThresholdOptions } from '../options';
import { useSession } from '../session';

const isMacOS = navigator.userAgent.toLowerCase().indexOf('mac') >= 0;

const LOGS_FOLDER = isMacOS ? `${window.process.env.HOME}/Library/Logs/RDCClient` : '.';

export const EnginesProvider: FC = ({ children }) => {
  const rtcEngineType = useRDCEngineType();
  const rdcOptions = useRDCThresholdOptions();
  const session = useSession();
  const [rtcEngine, setRtcEngine] = useState<RTCEngine>();
  const [rdcEngine, setRDCEngine] = useState<RDCEngine>();

  useEffect(() => {
    if (!session || !rtcEngineType || (rdcEngine && rtcEngine)) {
      return;
    }
    const { appId, rdcRole } = session;
    if (rtcEngineType === 'electron') {
      const rtcEngine = new AgoraRtcEngine();
      rtcEngine.initialize(appId, 1, { filePath: `${LOGS_FOLDER}/agora_rtc_sdk.log`, level: 1, fileSizeInKB: 2048 });
      // rtcEngine.videoSourceSetLogFile(`${LOGS_FOLDER}/agora_rtc_sdk_video_source.log`);
      const rdcEngine = RDCEngineWithElectronRTC.create(rtcEngine, {
        role: rdcRole,
        appId,
        ...rdcOptions,
      });
      setRtcEngine(rtcEngine);
      setRDCEngine(rdcEngine);
      return;
    }
    if (rtcEngineType === 'web') {
      const rtcEngine = AgoraRTC.createClient({ role: 'host', mode: 'rtc', codec: 'av1' });
      const rdcEngine = RDCEngineWithWebRTC.create(rtcEngine, {
        role: rdcRole,
        appId,
        ...rdcOptions,
      });
      setRtcEngine(rtcEngine);
      setRDCEngine(rdcEngine);
      return;
    }
  }, [session, rdcOptions, rtcEngineType, rdcEngine, rtcEngine]);

  // Join Channel
  useEffect(() => {
    if (!session || !rdcEngine || !rtcEngine) {
      return;
    }
    const { userId, userToken, channel, screenStreamId, screenStreamToken, cameraStreamId, cameraStreamToken } =
      session;
    rdcEngine.join(userId, userToken, channel, screenStreamId, screenStreamToken);
    if (rdcEngine.getRole() === RDCRoleType.HOST) {
      rdcEngine.allowObservation();
    }

    if (rtcEngineType === 'electron' && rtcEngine instanceof AgoraRtcEngine) {
      rtcEngine.setChannelProfile(0);
      rtcEngine.setClientRole(1);
      rtcEngine.enableVideo();
      rtcEngine.enableAudio();
      rtcEngine.enableLocalAudio(!isMacOS && rdcEngine.getRole() === RDCRoleType.CONTROLLED);
      rtcEngine.enableLocalVideo(false);
      rtcEngine.joinChannel(cameraStreamToken, channel, '', cameraStreamId);
    }
    if (rtcEngineType === 'web') {
      // TODO: implements
    }
  }, [session, rtcEngineType, rtcEngine, rdcEngine]);

  return <EnginesContext.Provider value={{ rtcEngine, rdcEngine, rtcEngineType }}>{children}</EnginesContext.Provider>;
};
