import React, { FC, ReactNode, useState } from 'react';
import { Affix, Button, Drawer, List } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useProfiles } from '../../hooks/profiles';
import { useSession } from '../../hooks/session';
import { Profile } from '../../api';

export interface ProfilesProps {
  renderItem: (profile: Profile) => ReactNode;
}

export const Profiles: FC<ProfilesProps> = ({ renderItem }) => {
  const session = useSession();
  const profiles = useProfiles();
  const [visible, setVisible] = useState(true);

  return (
    <>
      {session ? (
        <>
          <Drawer forceRender={true} width="500" visible={visible} onClose={() => setVisible(false)} closeIcon={null}>
            <List itemLayout="horizontal" dataSource={profiles} renderItem={renderItem} />
          </Drawer>
          <Affix style={{ position: 'absolute', right: 10, bottom: 20 }}>
            <Button shape="circle" icon={<UserOutlined />} type="primary" onClick={() => setVisible(true)} />
          </Affix>
        </>
      ) : null}
    </>
  );
};
