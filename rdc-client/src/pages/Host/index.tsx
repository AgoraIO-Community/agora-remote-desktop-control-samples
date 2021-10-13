import React, { useEffect, useState, FC, useCallback, useMemo } from 'react';
import { RDCRemotePasteCodes, RDCRemotePastePayload, RDCRemotePasteStatus, RDCRoleType } from 'agora-rdc-core';
import { AgoraRemoteDesktopControl as RDCEngineWithElectronRTC } from 'agora-rdc-electron';
import { AgoraRemoteDesktopControl as RDCEngineWithWebRTC } from 'agora-rdc-webrtc-electron';
import AgoraRtcEngine from 'agora-electron-sdk';
import AgoraRTC, { IAgoraRTCClient, IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';
import { useParams, useLocation } from 'react-router-dom';
import { fetchProfiles, fetchSession } from '../../api';
import { useAsync } from 'react-use';
import { Affix, Button, Divider, Drawer, List, message, Tabs } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import qs from 'querystring';
import RDC from './RDC';
import './index.css';
import { HostOptions } from '../../interfaces';

const isMacOS = navigator.platform.toLowerCase().indexOf('mac') >= 0;

const LOG_FOLDER = isMacOS ? `${window.process.env.HOME}/Library/Logs/RDCPrimary` : '.';

const Session: FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const location = useLocation();
  const [visible, setVisible] = useState(true);
  const [screenStreamIds, setScreenStreamIds] = useState<number[]>([]);
  const [userIdsUnderControl, setUserIdsUnderControl] = useState<string[]>([]);
  const sessionState = useAsync(() => fetchSession(userId), [userId]);
  const profilesState = useAsync(() => fetchProfiles(userId), [userId, screenStreamIds]);
  const [rtcEngine, setRtcEngine] = useState<AgoraRtcEngine | IAgoraRTCClient | undefined>();
  const [rdcEngine, setRDCEngine] = useState<RDCEngineWithElectronRTC | RDCEngineWithWebRTC | undefined>();
  
  const channel = sessionState.value?.data.channel;
  const session = sessionState.value?.data;
  const profiles = useMemo(() => profilesState.value?.data ?? [], [profilesState]);
  const { opts } = qs.parse(location.search.replace('?', '')) as { opts: string };
  const options: Partial<HostOptions> = useMemo(() => (opts ? JSON.parse(atob(opts)) : {}), [opts]);

  const handleRequestControlAuthorized = useCallback(
    (userId: string) => setUserIdsUnderControl([...userIdsUnderControl, userId]),
    [userIdsUnderControl, setUserIdsUnderControl],
  );

  const handleRequestControlUnauthorized = useCallback(
    (userId: string) => {
      const profile = profiles.find((p) => p.userId === userId);
      if (profile) {
        message.warn(`${profile.name} is declined your request`);
      }
    },
    [profiles],
  );

  const handleQuitControlEvent = useCallback(
    (userId: string) => setUserIdsUnderControl(userIdsUnderControl.filter((userIdUC) => userIdUC !== userId)),
    [userIdsUnderControl, setUserIdsUnderControl],
  );

  const handleRemotePaste = useCallback((payload: RDCRemotePastePayload) => {
    if (payload.code === RDCRemotePasteCodes.SUCCEEDED && payload.status === RDCRemotePasteStatus.STARTING) {
      message.loading({
        key: 'rdc-remote-pasting',
        content: 'File is pasting...',
      });
    }
    if (payload.code === RDCRemotePasteCodes.SUCCEEDED && payload.status === RDCRemotePasteStatus.SUCCEEDED) {
      message.success('File is pasted.');
      message.destroy('rdc-remote-pasting');
    }

    if (payload.code !== RDCRemotePasteCodes.SUCCEEDED && payload.status === RDCRemotePasteStatus.FAILED) {
      message.error('Failed to pasting file.');
      message.destroy('rdc-remote-pasting');
    }
  }, []);

  const handleStreamJoined = useCallback(
    (streamIdentifier: number | IAgoraRTCRemoteUser) => {
      if (typeof streamIdentifier === 'number' && profiles.find((p) => p.screenStreamId === streamIdentifier)) {
        setScreenStreamIds([...screenStreamIds, streamIdentifier]);
        return;
      }
      const remoteUser = streamIdentifier as IAgoraRTCRemoteUser;
      if (profiles.find((p) => p.screenStreamId === remoteUser.uid)) {
        setScreenStreamIds([...screenStreamIds, remoteUser.uid as number]);
      }
    },
    [profiles, screenStreamIds],
  );

  const handleStreamLeft = useCallback(
    (streamIdentifier: number | IAgoraRTCRemoteUser) => {
      if (typeof streamIdentifier === 'number') {
        setScreenStreamIds(screenStreamIds.filter((streamId) => streamId === streamIdentifier));
        return;
      }
      const remoteUser = streamIdentifier as IAgoraRTCRemoteUser;
      setScreenStreamIds(screenStreamIds.filter((streamId) => streamId === remoteUser.uid));
    },
    [screenStreamIds, setScreenStreamIds],
  );

  const handleBeforeunload = useCallback(() => {
    if (!rdcEngine) {
      return;
    }
    profiles
      .filter((p) => userIdsUnderControl.includes(p.userId))
      .forEach(({ userId, rdcRole }) => rdcEngine.quitControl(userId, rdcRole));
    rdcEngine.leave();
    rdcEngine.dispose();
  }, [rdcEngine, userIdsUnderControl, profiles]);

  useEffect(() => {
    if (!session || !location) {
      return;
    }
    const { appId } = session;
    if (options.rtcSDK === 'electron') {
      const rtcEngine = new AgoraRtcEngine();
      console.log.call(window, `Log files path: ${LOG_FOLDER}`);
      rtcEngine.initialize(appId, 1, { filePath: `${LOG_FOLDER}/agora_rtc_sdk.log`, level: 1, fileSize: 2048 });
      const rdcEngine = RDCEngineWithElectronRTC.create(rtcEngine, {
        role: RDCRoleType.HOST,
        appId,
        ...options,
      });
      rtcEngine.videoSourceSetLogFile(`${LOG_FOLDER}/agora_rtc_sdk_video_source.log`);
      setRtcEngine(rtcEngine);
      setRDCEngine(rdcEngine);
      return;
    }
    if (options.rtcSDK === 'web') {
      const rtcEngine = AgoraRTC.createClient({ role: 'host', mode: 'rtc', codec: 'av1' });
      const rdcEngine = RDCEngineWithWebRTC.create(rtcEngine, {
        role: RDCRoleType.HOST,
        appId,
        ...options,
      });
      setRtcEngine(rtcEngine);
      setRDCEngine(rdcEngine);
    }
  }, [session, location, options]);

  // Join Channel
  useEffect(() => {
    if (!session || !rdcEngine || !rtcEngine) {
      return;
    }
    const { userId, userToken, channel, screenStreamId, screenStreamToken, cameraStreamId, cameraStreamToken } =
      session;
    rdcEngine.join(userId, userToken, channel, screenStreamId, screenStreamToken);

    if (options.rtcSDK === 'electron' && rtcEngine instanceof AgoraRtcEngine) {
      rtcEngine.setChannelProfile(0);
      rtcEngine.setClientRole(1);
      rtcEngine.enableVideo();
      rtcEngine.joinChannel(cameraStreamToken, channel, '', cameraStreamId);
    }
    if (options.rtcSDK === 'web') {
      // TODO: implements
    }
  }, [sessionState, rtcEngine, rdcEngine, session, options]);

  // Handle RDC Events
  useEffect(() => {
    if (!rdcEngine) {
      return;
    }
    rdcEngine.on('rdc-request-control-authorized', handleRequestControlAuthorized);
    rdcEngine.on('rdc-request-control-unauthorized', handleRequestControlUnauthorized);
    rdcEngine.on('rdc-quit-control', handleQuitControlEvent);
    rdcEngine.on('rdc-remote-paste', handleRemotePaste);
    return () => {
      rdcEngine.off('rdc-request-control-authorized', handleRequestControlAuthorized);
      rdcEngine.off('rdc-request-control-unauthorized', handleRequestControlUnauthorized);
      rdcEngine.off('rdc-quit-control', handleQuitControlEvent);
      rdcEngine.off('rdc-remote-paste', handleRemotePaste);
    };
  }, [
    handleQuitControlEvent,
    handleRequestControlAuthorized,
    handleRequestControlUnauthorized,
    handleRemotePaste,
    rdcEngine,
  ]);

  // Handle RTC Events
  useEffect(() => {
    if (!rtcEngine || !options) {
      return;
    }
    if (options.rtcSDK === 'electron' && rtcEngine instanceof AgoraRtcEngine) {
      rtcEngine.on('userJoined', handleStreamJoined);
      rtcEngine.on('removeStream', handleStreamLeft);
    }
    if (options.rtcSDK === 'web') {
      (rtcEngine as IAgoraRTCClient).on('user-joined', handleStreamJoined);
      (rtcEngine as IAgoraRTCClient).on('user-left', handleStreamLeft);
    }
    return () => {
      if (options.rtcSDK === 'electron' && rtcEngine instanceof AgoraRtcEngine) {
        rtcEngine.off('userJoined', handleStreamJoined);
        rtcEngine.off('removeStream', handleStreamLeft);
      }
      if (options.rtcSDK === 'web') {
        (rtcEngine as IAgoraRTCClient).off('user-joined', handleStreamJoined);
        (rtcEngine as IAgoraRTCClient).off('user-left', handleStreamLeft);
      }
    };
  }, [handleStreamJoined, handleStreamLeft, options, rtcEngine]);

  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeunload);
    return () => window.removeEventListener('beforeunload', handleBeforeunload);
  }, [rdcEngine, handleBeforeunload]);

  const handleRequestControl = (userId: string, name: string) => {
    rdcEngine?.requestControl(userId);
    setVisible(false);
    message.success(`Control request has been sent to ${name}.`);
  };

  const handleQuitControl = (userId: string, role: RDCRoleType, streamId: number) => {
    rdcEngine?.quitControl(userId, role, streamId);
  };

  return (
    <div className="primary-rdc">
      <Tabs>
        {profiles
          .filter((profile) => userIdsUnderControl.includes(profile.userId))
          .map((profile) => (
            <Tabs.TabPane tab={profile.name} key={profile.userId} forceRender>
              <RDC userId={profile.userId} streamId={profile.screenStreamId} rdcEngine={rdcEngine} />
            </Tabs.TabPane>
          ))}
      </Tabs>
      <Drawer forceRender={true} width="500" visible={visible} onClose={() => setVisible(false)} closeIcon={null}>
        <List
          itemLayout="horizontal"
          dataSource={profiles.filter((profile) => screenStreamIds.includes(profile.screenStreamId))}
          renderItem={(profile) => (
            <List.Item>
              <div>
                <span style={{ marginRight: 10 }}>{profile.name}</span>
                <Button
                  type="link"
                  onClick={() => handleRequestControl(profile.userId, profile.name)}
                  disabled={userIdsUnderControl.includes(profile.userId)}>
                  Request Control
                </Button>
                <Divider type="vertical" />
                <Button
                  type="link"
                  onClick={() => handleQuitControl(profile.userId, profile.rdcRole, profile.screenStreamId)}
                  disabled={!userIdsUnderControl.includes(profile.userId)}>
                  Quit Control
                </Button>
              </div>
            </List.Item>
          )}
        />
      </Drawer>
      <Affix style={{ position: 'absolute', right: 10, bottom: 20 }}>
        <Button shape="circle" icon={<UserOutlined />} type="primary" onClick={() => setVisible(true)} />
      </Affix>
      {channel ? <div className="channel">CHANNEL: {channel}</div> : null}
    </div>
  );
};

export default Session;
