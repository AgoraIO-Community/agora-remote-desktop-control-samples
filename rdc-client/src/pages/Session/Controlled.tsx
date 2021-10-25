import React, { FC, useState } from 'react';
import { Button, Divider, List, Tabs, Tag } from 'antd';
import { Profile } from '../../api';
import { Profiles } from './Profiles';
import { useSession } from '../../hooks/session';
import { RDCRoleType } from 'agora-rdc-core';
import { useProfiles } from '../../hooks/profiles';
import { Observer } from './Observer';
import { useEngines } from '../../hooks/engines';

export const Controlled: FC = () => {
  const { rdcEngine } = useEngines();
  const session = useSession();
  const profiles = useProfiles();
  const [userIdsUnderObserving, setUserIdsUnderObserving] = useState<string[]>([]);
  const renderItem = (profile: Profile) => (
    <List.Item>
      <div>
        <span style={{ marginRight: 10 }}>{profile.name}</span>
        {profile.rdcRole === RDCRoleType.HOST ? <Tag color="gold">HOST</Tag> : null}
        {profile.rdcRole === RDCRoleType.CONTROLLED ? (
          <>
            <Button
              type="link"
              onClick={() => handleObserve(profile.userId)}
              disabled={userIdsUnderObserving.includes(profile.userId)}>
              Start Observation
            </Button>
            <Divider type="vertical" />
            <Button
              type="link"
              onClick={() => handleUnobserve(profile.userId, profile.screenStreamId)}
              disabled={!userIdsUnderObserving.includes(profile.userId)}>
              Stop Observation
            </Button>
          </>
        ) : null}
      </div>
    </List.Item>
  );

  const handleObserve = (userId: string) => {
    setUserIdsUnderObserving([...userIdsUnderObserving, userId]);
  };

  const handleUnobserve = (userId: string, streamId: number) => {
    rdcEngine?.unobserve(userId, streamId);
    setUserIdsUnderObserving([...userIdsUnderObserving.filter((id) => id !== userId)]);
  };

  return session && session.rdcRole === RDCRoleType.CONTROLLED ? (
    <>
      <Tabs>
        {profiles
          .filter((profile) => userIdsUnderObserving.includes(profile.userId))
          .map((profile) => (
            <Tabs.TabPane tab={profile.name} key={profile.userId} forceRender>
              <Observer userId={profile.userId} streamId={profile.screenStreamId} />
            </Tabs.TabPane>
          ))}
      </Tabs>

      <Profiles renderItem={renderItem} />
    </>
  ) : null;
};
