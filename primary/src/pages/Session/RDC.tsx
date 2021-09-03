import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { AgoraRemoteDesktopControl as RDCEngineWithElectronRTC } from 'agora-rdc-electron';
import { AgoraRemoteDesktopControl as RDCEngineWithWebRTC } from 'agora-rdc-webrtc-electron';
import { Button } from 'antd';
import { FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons';
import { useThrottleFn } from 'react-use';

export interface RDCProps {
  cUid: number;
  rdcEngine?: RDCEngineWithElectronRTC | RDCEngineWithWebRTC;
}

const RDC: FC<RDCProps> = ({ cUid, rdcEngine }) => {
  const attachRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullScreen] = useState<boolean>();
  const [[width, height], setSize] = useState<[number, number]>([window.innerWidth, window.innerHeight - 56]);
  const size = useThrottleFn<[number, number], [number, number]>((w, h) => [w, h], 100, [width, height]);

  const handleResize = useCallback(() => setSize([window.innerWidth, window.innerHeight - 56]), [setSize]);

  useEffect(() => {
    if (rdcEngine && attachRef && attachRef.current) {
      rdcEngine.takeControl(cUid, attachRef.current);
      rdcEngine.on('rdc-fullscreen-change', (iFS) => setIsFullScreen(iFS));
    }
  }, [cUid, rdcEngine, attachRef]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  const handleFullScreen = () => {
    if (!isFullscreen && rdcEngine && attachRef && attachRef.current) {
      rdcEngine.requestFullscreen(attachRef.current);
    }
    if (isFullscreen && rdcEngine) {
      rdcEngine.exitFullscreen();
    }
  };

  return (
    <div className="primary-rdc-screen-wrap">
      <div className="rdc-screen" ref={attachRef} style={size ? { width: size[0], height: size[1] } : undefined} />
      <div className="control-bar">
        <Button
          type="primary"
          shape="circle"
          icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
          onClick={handleFullScreen}
        />
      </div>
    </div>
  );
};

export default RDC;
