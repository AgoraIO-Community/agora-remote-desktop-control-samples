import React, { FC } from 'react';
import { useSession } from '../../hooks/session';

export const Channel: FC = () => {
  const session = useSession();
  return <>{session ? <div className="channel">CHANNEL: {session.channel}</div> : null}</>;
};
