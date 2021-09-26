import React, { useEffect, useState, FC, useCallback } from 'react';
import { RDCRoleType, RDCDisplay, RDCDisplayConfiguration } from 'agora-rdc-core';
import { AgoraRemoteDesktopControl as RDCEngineWithElectronRTC } from 'agora-rdc-electron';
import { AgoraRemoteDesktopControl as RDCEngineWithWebRTC } from 'agora-rdc-webrtc-electron';
import AgoraRtcEngine from 'agora-electron-sdk';
import AgoraRTC, { IAgoraRTCClient } from 'agora-rtc-sdk-ng';
import { useLocation, useParams } from 'react-router-dom';
import { useAsync } from 'react-use';
import { Affix, Button, message, Modal, Popconfirm, Tabs } from 'antd';
import { PoweroffOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import qs from 'querystring';
import { fetchSession } from '../../api';
import { RESOLUTION_BITRATE } from '../../constants';
import './index.css';
import { ControlledOptions } from '../../interfaces';

const isMacOS = navigator.platform.toLowerCase().indexOf('mac') >= 0;

const LOG_FOLDER = isMacOS ? `${window.process.env.HOME}/Library/Logs/RDCSecondary` : '.';

const Session: FC = () => {
  const location = useLocation();
  const { uid } = useParams<{ uid: string; opts?: string }>();
  const { value } = useAsync(() => fetchSession(uid), [uid]);
  const [rtcEngine, setRtcEngine] = useState<AgoraRtcEngine | IAgoraRTCClient | undefined>();
  const [rdcEngine, setRDCEngine] = useState<RDCEngineWithElectronRTC | RDCEngineWithWebRTC | undefined>();
  const [displays, setDisplays] = useState<RDCDisplay[]>([]);
  const [controlledById, setControlledById] = useState<number>();
  const [controlled, setControlled] = useState<boolean>(false);
  const [visible, setVisible] = useState(false);
  const [activeKey, setActiveKey] = useState<string>();

  const handleRequestControl = useCallback(
    (uid: number) => {
      if (!rdcEngine) {
        return;
      }
      rdcEngine.getDisplays().then((displays) => {
        setDisplays(displays);
        setControlledById(uid);
        setVisible(true);
      });
    },
    [rdcEngine],
  );

  const handleQuitControl = useCallback(
    (uid: number) => {
      if (!rdcEngine) {
        return;
      }
      rdcEngine.quitControl(uid);
      message.destroy(uid);
      message.info(`${uid} Release control.`);
      setControlledById(undefined);
      setControlled(false);
    },
    [rdcEngine],
  );

  const handleBeforeunload = useCallback(() => {
    if (!rdcEngine) {
      return;
    }
    if (controlledById) {
      rdcEngine.quitControl(controlledById);
    }
    rdcEngine.leave();
    // rdcEngine.dispose();
  }, [rdcEngine, controlledById]);

  // Initialize Engine
  useEffect(() => {
    if (!value || !location) {
      return;
    }
    const { opts } = qs.parse(location.search.replace('?', '')) as { opts: string };
    const options: Partial<ControlledOptions> = opts ? JSON.parse(atob(opts)) : {};
    const { appId } = value.data;

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
  }, [value, rdcEngine, rtcEngine]);

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
  }, [rdcEngine, controlledById, handleBeforeunload]);

  const handleAuthorize = (display: RDCDisplay) => {
    if (!controlledById || !rdcEngine) {
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
    rdcEngine.authorizeControl(controlledById, display, captureParams);
    setVisible(false);
    setControlled(true);
    message.warn({
      content: `Your computer is controlled by ${controlledById}`,
      duration: 0,
      key: controlledById,
    });
  };

  const declineRequest = () => {
    if (!controlledById) {
      return;
    }
    setVisible(false);
    rdcEngine?.unauthorizeControl(controlledById);
    message.info(`You have been declined control request from ${controlledById}`);
    setControlledById(undefined);
    setControlled(false);
  };

  const handleStopControl = () => {
    if (!rdcEngine || !controlledById) {
      return;
    }

    rdcEngine.quitControl(controlledById);
    message.destroy(controlledById);
    message.info(`You have stopped control by ${controlledById}.`);
    setControlledById(undefined);
    setControlled(false);
  };

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
      {value?.data.channel ? <div className="channel">CHANNEL: {value?.data.channel}</div> : null}
      {controlledById && controlled ? (
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
    </div>
  );
};

export default Session;
