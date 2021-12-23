import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useThrottleFn } from 'react-use';
import { useEngines } from '../../hooks/engines';

export interface ObserverProps {
  userId: string;
  streamId: number;
}

export const Observer: FC<ObserverProps> = ({ streamId, userId }) => {
  const { rdcEngine } = useEngines();
  const attachRef = useRef<HTMLDivElement>(null);
  const [[width, height], setSize] = useState<[number, number]>([window.innerWidth, window.innerHeight - 56]);
  const size = useThrottleFn<[number, number], [number, number]>((w, h) => [w, h], 100, [width, height]);
  const handleResize = useCallback(() => setSize([window.innerWidth, window.innerHeight - 56]), [setSize]);

  useEffect(() => {
    if (rdcEngine && attachRef && attachRef.current) {
      rdcEngine.observe(userId, streamId, attachRef.current);
    }
  }, [userId, streamId, rdcEngine, attachRef]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  return (
    <div className="rdc-client-screen-wrap">
      <div className="rdc-screen" ref={attachRef} style={size ? { width: size[0], height: size[1] } : undefined} />
    </div>
  );
};
