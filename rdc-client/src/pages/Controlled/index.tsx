import React, { useEffect, useState, FC, useCallback, useMemo } from 'react';
import { RDCRoleType, RDCDisplay, RDCDisplayConfiguration } from 'agora-rdc-core';
import { AgoraRemoteDesktopControl as RDCEngineWithElectronRTC } from 'agora-rdc-electron';
import { AgoraRemoteDesktopControl as RDCEngineWithWebRTC } from 'agora-rdc-webrtc-electron';
import AgoraRtcEngine from 'agora-electron-sdk';
import AgoraRTC, { IAgoraRTCClient, IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';
import { useLocation, useParams } from 'react-router-dom';
import { useAsync } from 'react-use';
import { Affix, Button, message, Modal, Popconfirm, Tabs } from 'antd';
import { PoweroffOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import qs from 'querystring';
import { fetchProfiles, fetchSession } from '../../api';
import { RESOLUTION_BITRATE } from '../../constants';
import './index.css';
import { ControlledOptions } from '../../interfaces';

const isMacOS = navigator.platform.toLowerCase().indexOf('mac') >= 0;

const LOG_FOLDER = isMacOS ? `${window.process.env.HOME}/Library/Logs/RDCSecondary` : '.';

const Session: FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const location = useLocation();
  const [screenStreamIds, setScreenStreamIds] = useState<number[]>([]);
  const sessionState = useAsync(() => fetchSession(userId), [userId]);
  const profilesState = useAsync(() => fetchProfiles(userId), [userId, screenStreamIds]);
  const [rtcEngine, setRtcEngine] = useState<AgoraRtcEngine | IAgoraRTCClient | undefined>();
  const [rdcEngine, setRDCEngine] = useState<RDCEngineWithElectronRTC | RDCEngineWithWebRTC | undefined>();
  const [visible, setVisible] = useState(false);
  const [activeKey, setActiveKey] = useState<string>();
  const [displays, setDisplays] = useState<RDCDisplay[]>([]);
  const [userIdControlledBy, setUserIdControlledBy] = useState<string>();
  const [controlled, setControlled] = useState<boolean>(false);

  const channel = sessionState.value?.data.channel;
  const session = sessionState.value?.data;
  const profiles = useMemo(() => profilesState.value?.data ?? [], [profilesState]);
  const { opts } = qs.parse(location.search.replace('?', '')) as { opts: string };
  const options: Partial<ControlledOptions> = useMemo(() => (opts ? JSON.parse(atob(opts)) : {}), [opts]);

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

  const handleRequestControl = useCallback(
    (userId: string) => {
      if (!rdcEngine) {
        return;
      }
      rdcEngine.getDisplays().then((displays) => {
        setDisplays(displays);
        setUserIdControlledBy(userId);
        setVisible(true);
      });
    },
    [rdcEngine],
  );

  const handleQuitControl = useCallback(
    (userId: string) => {
      if (!rdcEngine || !profiles) {
        return;
      }
      const profile = profiles.find((p) => p.userId === userId);
      if (!profile) {
        return;
      }
      rdcEngine.quitControl(userId, profile.rdcRole);
      message.destroy(userId);
      message.info(`${profile.name} is released control.`);
      setUserIdControlledBy(undefined);
      setControlled(false);
    },
    [rdcEngine, profiles],
  );

  const handleBeforeunload = useCallback(() => {
    const profile = profiles.find((profile) => profile.userId === userIdControlledBy);
    if (!rdcEngine || !userIdControlledBy || !profile) {
      return;
    }

    rdcEngine.quitControl(profile.userId, profile.rdcRole);
    rdcEngine.leave();
    // rdcEngine.dispose();
  }, [rdcEngine, userIdControlledBy, profiles]);

  // Initialize Engine
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
        role: RDCRoleType.CONTROLLED,
        appId,
      });
      rtcEngine.videoSourceSetLogFile(`${LOG_FOLDER}/agora_rtc_sdk_video_source.log`);
      setRtcEngine(rtcEngine);
      setRDCEngine(rdcEngine);
    }

    if (options.rtcSDK === 'web') {
      const rtcEngine = AgoraRTC.createClient({ role: 'host', mode: 'rtc', codec: 'av1' });
      const rdcEngine = RDCEngineWithWebRTC.create(rtcEngine, {
        role: RDCRoleType.CONTROLLED,
        appId,
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
  }, [session, rdcEngine, rtcEngine, options]);

  // Handle Events
  useEffect(() => {
    if (!rdcEngine) {
      return;
    }
    rdcEngine.on('rdc-request-control', handleRequestControl);
    rdcEngine.on('rdc-quit-control', handleQuitControl);
    return () => {
      rdcEngine.off('rdc-request-control', handleRequestControl);
      rdcEngine.off('rdc-quit-control', handleQuitControl);
    };
  }, [rdcEngine, handleQuitControl, handleRequestControl]);

  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeunload);
    return () => window.removeEventListener('beforeunload', handleBeforeunload);
  }, [rdcEngine, handleBeforeunload]);

  const handleAuthorize = useCallback((display: RDCDisplay) => {
    const profile = profiles.find((profile) => profile.userId === userIdControlledBy);
    if (!userIdControlledBy || !rdcEngine || !profile) {
      return;
    }
    const { opts } = qs.parse(location.search.replace('?', '')) as { opts: string };
    const { resolutionBitrate, frameRate }: Partial<ControlledOptions> = opts ? JSON.parse(atob(opts)) : {};
    const captureParams: Partial<RDCDisplayConfiguration> = { frameRate };
    if (resolutionBitrate) {
      const { width, height, bitrate } = RESOLUTION_BITRATE[resolutionBitrate];
      captureParams.width = width;
      captureParams.height = height;
      captureParams.bitrate = bitrate;
    }
    rdcEngine.authorizeControl(userIdControlledBy, display, captureParams);
    setVisible(false);
    setControlled(true);
    message.warn({
      content: `Your computer is controlled by ${profile.name}`,
      duration: 0,
      key: profile.userId,
    });
  }, [location.search, profiles, rdcEngine, userIdControlledBy]);

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

  const declineRequest = useCallback(() => {
    const profile = profiles.find((profile) => {
      return  profile.userId === userIdControlledBy;
    });
    if (!profile) {
      return;
    }
    setVisible(false);
    rdcEngine?.unauthorizeControl(profile.userId);
    message.info(`You have been declined control request from ${profile.name}`);
    setUserIdControlledBy(undefined);
    setControlled(false);
  }, [profiles, rdcEngine, userIdControlledBy]);

  const handleStopControl = useCallback(() => {
    const profile = profiles.find((profile) => profile.userId === userIdControlledBy);
    if (!rdcEngine || !profile) {
      return;
    }

    rdcEngine.quitControl(profile.userId, profile.rdcRole);
    message.destroy(profile.userId);
    message.info(`You have stopped control by ${profile.name}.`);
    setUserIdControlledBy(undefined);
    setControlled(false);
  }, [profiles, rdcEngine, userIdControlledBy]);

  return (
    <div className="secondary-rdc">
      <Modal
        title="Please click the screen which you want to authorize."
        visible={visible}
        footer={null}
        onCancel={declineRequest}
        bodyStyle={{ padding: 8 }}>
        <Tabs activeKey={activeKey} onTabClick={(ac) => setActiveKey(ac)}>
          {displays.map((display, index) => (
            <Tabs.TabPane tab={`Display: ${display.width} x ${display.height}`} key={`index`}>
              <div
                style={{ height: '100%', width: '100%', cursor: 'pointer' }}
                onClick={() => handleAuthorize(display)}>
                <img style={{ maxHeight: '100%', maxWidth: '100%' }} src={display.thumbnail} alt="display" />
              </div>
            </Tabs.TabPane>
          ))}
        </Tabs>
      </Modal>
      {userIdControlledBy && controlled ? (
        <Affix style={{ position: 'absolute', top: 8, right: 8 }}>
          <Popconfirm
            onConfirm={handleStopControl}
            title="Are you sure to stop control？"
            placement="bottomLeft"
            icon={<QuestionCircleOutlined style={{ color: 'red' }} />}>
            <Button type="primary" shape="circle" danger={true}>
              <PoweroffOutlined />
            </Button>
          </Popconfirm>
        </Affix>
      ) : null}
      {channel ? <div className="channel">CHANNEL: {channel}</div> : null}
    </div>
  );
};

export default Session;
