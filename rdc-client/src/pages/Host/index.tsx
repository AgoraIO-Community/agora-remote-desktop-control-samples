import React, { useEffect, useState, FC, useCallback } from 'react';
import { RDCRemotePasteCodes, RDCRemotePastePayload, RDCRemotePasteStatus, RDCRoleType } from 'agora-rdc-core';
import { AgoraRemoteDesktopControl as RDCEngineWithElectronRTC } from 'agora-rdc-electron';
import { AgoraRemoteDesktopControl as RDCEngineWithWebRTC } from 'agora-rdc-webrtc-electron';
import AgoraRtcEngine from 'agora-electron-sdk';
import AgoraRTC, { IAgoraRTCClient } from 'agora-rtc-sdk-ng';
import { useParams, useLocation } from 'react-router-dom';
import { fetchSession } from '../../api';
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
  const { uid } = useParams<{ uid: string }>();
  const location = useLocation();
  const [visible, setVisible] = useState(true);
  const { value } = useAsync(() => fetchSession(uid), [uid]);
  const [joinedRdcUids, setJoinedRdcUids] = useState<number[]>([]);
  const [controlledUids, setControlledUids] = useState<number[]>([]);
  const [rtcEngine, setRtcEngine] = useState<AgoraRtcEngine | IAgoraRTCClient | undefined>();
  const [rdcEngine, setRDCEngine] = useState<RDCEngineWithElectronRTC | RDCEngineWithWebRTC | undefined>();

  const handleScreenStreamJoined = useCallback(
    (uid) => {
      if (joinedRdcUids.includes(uid)) {
        return;
      }
      message.info(`${uid} has been joined session.`);
      setJoinedRdcUids([...joinedRdcUids, uid]);
    },
    [joinedRdcUids, setJoinedRdcUids],
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

  const handleScreenStreamLeaved = useCallback(
    (uid) => {
      setJoinedRdcUids(joinedRdcUids.filter((jUid) => jUid !== uid));
      message.info(`${uid} has been leaved session.`);
    },
    [joinedRdcUids, setJoinedRdcUids],
  );

  const handleRequestControlAuthorized = useCallback(
    (uid: number) => setControlledUids([...controlledUids, uid]),
    [controlledUids, setControlledUids],
  );

  const handleRequestControlUnauthorized = useCallback((uid: number) => {
    message.warn(`${uid}, declined your control request`);
  }, []);

  const handleQuitControlEvent = useCallback(
    (uid) => setControlledUids(controlledUids.filter((cUid) => cUid !== uid)),
    [controlledUids, setControlledUids],
  );

  const handleBeforeunload = useCallback(() => {
    if (!rdcEngine) {
      return;
    }
    controlledUids.forEach((cUid) => rdcEngine.quitControl(cUid));
    rdcEngine.leave();
    rdcEngine.dispose();
  }, [rdcEngine, controlledUids]);

  // Initialize Engine
  useEffect(() => {
    if (!value || !location) {
      return;
    }
    const { opts } = qs.parse(location.search.replace('?', '')) as { opts: string };
    const options: Partial<HostOptions> = opts ? JSON.parse(atob(opts)) : {};
    const { appId } = value.data;
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
  }, [value, location]);

  // Join Channel
  useEffect(() => {
    if (!value || !rdcEngine || !rtcEngine) {
      return;
    }
    const { channel, rdc, rtc } = value.data;
    rdcEngine.join(rdc.uid, channel, rdc.tokens.rtc, rdc.tokens.rtm);

    if (rtcEngine instanceof AgoraRtcEngine) {
      rtcEngine.setChannelProfile(0);
      rtcEngine.setClientRole(1);
      rtcEngine.enableVideo();
      rtcEngine.joinChannel(rtc.token, channel, '', rtc.uid);
    }
  }, [value, rtcEngine, rdcEngine]);

  // Handle Events
  useEffect(() => {
    if (!rdcEngine) {
      return;
    }
    rdcEngine.on('rdc-screen-stream-joined', handleScreenStreamJoined);
    rdcEngine.on('rdc-screen-stream-leave', handleScreenStreamLeaved);
    rdcEngine.on('rdc-request-control-authorized', handleRequestControlAuthorized);
    rdcEngine.on('rdc-request-control-unauthorized', handleRequestControlUnauthorized);
    rdcEngine.on('rdc-quit-control', handleQuitControlEvent);
    rdcEngine.on('rdc-remote-paste', handleRemotePaste);
    return () => {
      rdcEngine.off('rdc-screen-stream-joined', handleScreenStreamJoined);
      rdcEngine.off('rdc-screen-stream-leave', handleScreenStreamLeaved);
      rdcEngine.off('rdc-request-control-authorized', handleRequestControlAuthorized);
      rdcEngine.off('rdc-request-control-unauthorized', handleRequestControlUnauthorized);
      rdcEngine.off('rdc-quit-control', handleQuitControlEvent);
      rdcEngine.off('rdc-remote-paste', handleRemotePaste);
    };
  }, [
    handleQuitControlEvent,
    handleRequestControlAuthorized,
    handleRequestControlUnauthorized,
    handleScreenStreamJoined,
    handleScreenStreamLeaved,
    rdcEngine,
  ]);

  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeunload);
    return () => window.removeEventListener('beforeunload', handleBeforeunload);
  }, [rdcEngine, controlledUids, handleBeforeunload]);

  const handleRequestControl = (uid: number) => {
    rdcEngine?.requestControl(uid);
    setVisible(false);
    message.success(`Control request has been sent to ${uid}.`);
  };

  const handleQuitControl = (uid: number) => {
    rdcEngine?.quitControl(uid);
  };

  return (
    <div className="primary-rdc">
      <Tabs>
        {controlledUids.map((cUid) => (
          <Tabs.TabPane tab={cUid} key={`${cUid}`} forceRender>
            <RDC cUid={cUid} rdcEngine={rdcEngine} />
          </Tabs.TabPane>
        ))}
      </Tabs>
      <Drawer forceRender={true} width="400" visible={visible} onClose={() => setVisible(false)} closeIcon={null}>
        <List
          itemLayout="horizontal"
          dataSource={joinedRdcUids}
          renderItem={(jUid) => (
            <List.Item>
              <div>
                <span style={{ marginRight: 10 }}>{jUid}</span>
                <Button type="link" onClick={() => handleRequestControl(jUid)} disabled={controlledUids.includes(jUid)}>
                  Request Control
                </Button>
                <Divider type="vertical" />
                <Button type="link" onClick={() => handleQuitControl(jUid)} disabled={!controlledUids.includes(jUid)}>
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
      {value?.data.channel ? <div className="channel">CHANNEL: {value?.data.channel}</div> : null}
    </div>
  );
};

export default Session;
