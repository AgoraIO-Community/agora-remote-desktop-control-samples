import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { Button, Tooltip } from 'antd';
import { FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons';
import { useThrottleFn } from 'react-use';
import { useEngines } from '../../hooks/engines';
import { RDCAndroidAction, RDCPlatform } from 'agora-rdc-core';
import { ACTION_MAPS } from './constants';

export interface ControllerProps {
  userId: string;
  streamId: number;
}

export const Controller: FC<ControllerProps> = ({ userId, streamId }) => {
  const { rdcEngine } = useEngines();
  const attachRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullScreen] = useState<boolean>();
  const [platform, setPlatform] = useState<RDCPlatform>();
  const [[width, height], setSize] = useState<[number, number]>([window.innerWidth, window.innerHeight]);
  const size = useThrottleFn<[number, number], [number, number]>((w, h) => [w, h], 100, [width, height]);

  const handleResize = useCallback(
    () => setSize([window.innerWidth, window.innerHeight - (platform === 'android' ? 104 : 56)]),
    [setSize, platform],
  );

  useEffect(
    () => setSize([window.innerWidth, window.innerHeight - (platform === 'android' ? 104 : 56)]),
    [platform, setSize],
  );

  useEffect(() => {
    if (!rdcEngine) {
      return;
    }
    rdcEngine.requestPlatform(userId).then((p) => {
      setPlatform(p);
    });
  }, [rdcEngine, userId]);

  useEffect(() => {
    if (rdcEngine && attachRef && attachRef.current) {
      rdcEngine.takeControl(userId, streamId, attachRef.current);
      rdcEngine.on('rdc-fullscreen-change', (iFS) => setIsFullScreen(iFS));
    }
  }, [userId, streamId, rdcEngine, attachRef]);

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

  const handleAction = (action: RDCAndroidAction) => {
    if (!rdcEngine || !platform) {
      return;
    }
    rdcEngine.sendAction(userId, platform, action);
  };

  return (
    <div className="rdc-client-screen-wrap">
      <div className="rdc-screen" style={size ? { width: size[0], height: size[1] } : undefined} ref={attachRef} />
      {platform === 'android' ? (
        <div className="action-bar">
          {ACTION_MAPS.map(({ tip, action, icon }) => (
            <Tooltip placement="top" title={tip}>
              <Button type="primary" shape="circle" icon={icon} onClick={() => handleAction(action)} />
            </Tooltip>
          ))}
        </div>
      ) : null}
      {platform === 'android' ? null : (
        <div className="control-bar">
          <Button
            type="primary"
            shape="circle"
            icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
            onClick={handleFullScreen}
          />
        </div>
      )}
    </div>
  );
};
