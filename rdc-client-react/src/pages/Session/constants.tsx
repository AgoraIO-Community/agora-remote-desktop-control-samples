import React from 'react';
import {
  LeftOutlined,
  HomeOutlined,
  UnorderedListOutlined,
  NotificationOutlined,
  SettingOutlined,
  PoweroffOutlined,
  SplitCellsOutlined,
  LockOutlined,
  CameraOutlined,
} from '@ant-design/icons';
import { RDCAndroidAction } from 'agora-rdc-core';

export const ACTION_MAPS = [
  {
    tip: 'Back',
    action: RDCAndroidAction.ACTION_BACK,
    icon: <LeftOutlined />,
  },
  {
    tip: 'Home',
    action: RDCAndroidAction.ACTION_HOME,
    icon: <HomeOutlined />,
  },
  {
    tip: 'Multi Task',
    action: RDCAndroidAction.ACTION_RECENT,
    icon: <UnorderedListOutlined />,
  },
  {
    tip: 'Notification Center',
    action: RDCAndroidAction.ACTION_NOTIFICATIONS,
    icon: <NotificationOutlined />,
  },
  {
    tip: 'Quick Settings',
    action: RDCAndroidAction.ACTION_QUICK_SETTINGS,
    icon: <SettingOutlined />,
  },
  {
    tip: 'Power Off',
    action: RDCAndroidAction.ACTION_POWER_DIALOG,
    icon: <PoweroffOutlined />,
  },
  {
    tip: 'Split Screen',
    action: RDCAndroidAction.ACTION_TOGGLE_SPLIT_SCREEN,
    icon: <SplitCellsOutlined />,
  },
  {
    tip: 'Lock Screen',
    action: RDCAndroidAction.ACTION_LOCK_SCREEN,
    icon: <LockOutlined />,
  },
  {
    tip: 'Screenshot',
    action: RDCAndroidAction.ACTION_SCREENSHOT,
    icon: <CameraOutlined />,
  },
];
