import React, { FC } from 'react';
import { useParams } from 'react-router-dom';
import { EnginesProvider } from '../../hooks/engines';
import { ProfilesProvider } from '../../hooks/profiles';
import { SessionProvider } from '../../hooks/session';
import { Channel } from './Channel';
import { Controlled } from './Controlled';
import { Host } from './Host';
import './index.css';

const Session: FC = () => {
  const { userId } = useParams<{ userId: string }>();
  return (
    <SessionProvider userId={userId}>
      <EnginesProvider>
        <ProfilesProvider userId={userId}>
          <div className="rdc-client">
            <Host />
            <Controlled />
            <Channel />
          </div>
        </ProfilesProvider>
      </EnginesProvider>
    </SessionProvider>
  );
};

export default Session;
