import React, { FC, useCallback, useEffect, useState } from 'react';
import { Button, Divider, List, message, Modal, Popconfirm, Tabs, Tag } from 'antd';
import { PoweroffOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Profile } from '../../api';
import { Profiles } from './Profiles';
import { useSession } from '../../hooks/session';
import { RDCDisplay, RDCRoleType } from 'agora-rdc-core';
import { useProfiles, useUserLeft } from '../../hooks/profiles';
import { Observer } from './Observer';
import { useEngines } from '../../hooks/engines';
import { useRDCDisplayConfiguration } from '../../hooks/options';

export const Controlled: FC = () => {
  const { rdcEngine } = useEngines();
  const session = useSession();
  const profiles = useProfiles();
  const rdcDisplayConfiguration = useRDCDisplayConfiguration();
  const [userIdsUnderObserving, setUserIdsUnderObserving] = useState<string[]>([]);
  const [visible, setVisible] = useState(false);
  const [activeKey, setActiveKey] = useState<string>();
  const [displays, setDisplays] = useState<RDCDisplay[]>([]);
  const [userIdControlledBy, setUserIdControlledBy] = useState<string>();

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
    },
    [rdcEngine, profiles],
  );

  const handleStopControl = useCallback(() => {
    const profile = profiles.find((profile) => profile.userId === userIdControlledBy);
    if (!rdcEngine || !profile) {
      return;
    }

    rdcEngine.quitControl(profile.userId, profile.rdcRole);
    message.destroy(profile.userId);
    message.info(`You have stopped control by ${profile.name}.`);
    setUserIdControlledBy(undefined);
  }, [profiles, rdcEngine, userIdControlledBy]);

  const declineRequest = useCallback(() => {
    const profile = profiles.find((profile) => {
      return profile.userId === userIdControlledBy;
    });
    if (!profile) {
      return;
    }
    setVisible(false);
    rdcEngine?.unauthorizeControl(profile.userId);
    message.info(`You have been declined control request from ${profile.name}`);
    setUserIdControlledBy(undefined);
  }, [profiles, rdcEngine, userIdControlledBy]);

  const handleObserve = (userId: string) => {
    setUserIdsUnderObserving([...userIdsUnderObserving, userId]);
  };

  const handleUnobserve = (userId: string, streamId: number) => {
    rdcEngine?.unobserve(userId, streamId);
    setUserIdsUnderObserving([...userIdsUnderObserving.filter((id) => id !== userId)]);
  };

  const handleAuthorize = useCallback(
    (display: RDCDisplay) => {
      const profile = profiles.find((profile) => profile.userId === userIdControlledBy);
      if (!userIdControlledBy || !rdcEngine || !profile) {
        return;
      }

      rdcEngine.authorizeControl(userIdControlledBy, display, rdcDisplayConfiguration, true);
      setVisible(false);
      message.warn({
        content: (
          <>
            <span>Your computer is controlled by {profile.name}. </span>
            <span>
              <Popconfirm
                onConfirm={handleStopControl}
                title="Are you sure to stop control？"
                placement="bottomLeft"
                icon={<QuestionCircleOutlined style={{ color: 'red' }} />}>
                <Button type="link" danger={true}>
                  <PoweroffOutlined style={{ color: 'red' }} />
                </Button>
              </Popconfirm>
            </span>
          </>
        ),
        duration: 0,
        key: profile.userId,
      });
    },
    [profiles, rdcEngine, userIdControlledBy, rdcDisplayConfiguration, handleStopControl],
  );

  const handleBeforeunload = useCallback(() => {
    const profile = profiles.find((profile) => profile.userId === userIdControlledBy);
    if (!rdcEngine || !userIdControlledBy || !profile) {
      return;
    }
    rdcEngine.quitControl(profile.userId, profile.rdcRole);
    rdcEngine.leave();
    rdcEngine.dispose();
  }, [rdcEngine, userIdControlledBy, profiles]);

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

  // hack for controlled end destroy rdc engine too early.
  useUserLeft(handleQuitControl);

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
    </>
  ) : null;
};
