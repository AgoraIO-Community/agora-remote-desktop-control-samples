import { AgoraRemoteDesktopControl, RDCRoleType } from 'agora-rdc-webrtc-electron';
import AgoraRTC, { IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';
import qs from 'querystring';
import { fetchProfiles, fetchSession, Profile } from './api';

(async () => {
  const { userId } = qs.parse(window.location.search.replace('?', '')) as { userId: string };
  const {
    data: { appId, userToken, channel, screenStreamId, screenStreamToken },
  } = await fetchSession(userId);
  let profiles: Profile[] = [];

  const rtcEngine = AgoraRTC.createClient({ codec: 'h264', mode: 'rtc', role: 'host' });
  const rdcEngine = AgoraRemoteDesktopControl.create(rtcEngine, { role: RDCRoleType.CONTROLLED, appId });

  const handleUserJoin = (user: IAgoraRTCRemoteUser) => {
    fetchProfiles(userId).then(({ data }) => {
      profiles = data;
    });
  };

  const handleUserLeft = (user: IAgoraRTCRemoteUser) => {
    const profile = profiles.find((p) => p.screenStreamId === user.uid);
    if (!profile) {
      return;
    }
    rdcEngine.quitControl(profile.userId, profile.rdcRole);
    const noticeEl = document.querySelector('#notice');
    if (noticeEl) {
      noticeEl.remove();
    }
  };

  const handleRequestControl = async (userId: string) => {
    const profile = profiles.find((p) => p.userId === userId);
    if (!profile) {
      return;
    }
    const displays = await rdcEngine.getDisplays();
    rdcEngine.authorizeControl(userId, displays[0]);
    const noticeEl = document.querySelector('#notice');
    if (noticeEl) {
      noticeEl.innerHTML = `Your personal computer is controlled by ${profile.name}`;
    }
  };

  const handleQuitControl = (userId: string) => {
    const profile = profiles.find((p) => p.userId === userId);
    if (!profile) {
      return;
    }
    rdcEngine.quitControl(profile.userId, profile.rdcRole);
    const noticeEl = document.querySelector('#notice');
    if (noticeEl) {
      noticeEl.remove();
    }
  };

  const bindEvents = () => {
    rtcEngine.on('user-joined', handleUserJoin);
    rtcEngine.on('user-left', handleUserLeft);
    rdcEngine.on('rdc-request-control', handleRequestControl);
    rdcEngine.on('rdc-quit-control', handleQuitControl);
  };

  bindEvents();
  rdcEngine.join(userId, userToken, channel, screenStreamId, screenStreamToken);
})();
