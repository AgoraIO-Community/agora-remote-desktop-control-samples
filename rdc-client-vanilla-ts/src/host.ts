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
  const rdcEngine = AgoraRemoteDesktopControl.create(rtcEngine, { role: RDCRoleType.HOST, appId });

  const handleUserJoin = (user: IAgoraRTCRemoteUser) => {
    fetchProfiles(userId).then(({ data }) => {
      const profile = data.find((p) => p.screenStreamId === user.uid);
      if (profile) {
        profiles.push(profile);
      }
      renderUserProfiles(profiles);
    });
  };

  const handleUserLeft = (user: IAgoraRTCRemoteUser) => {
    const profile = profiles.find((p) => p.screenStreamId === user.uid);
    if (!profile) {
      return;
    }
    profiles = profiles.filter((p) => p.screenStreamId !== user.uid);
    renderUserProfiles(profiles);
    rdcEngine.quitControl(profile.userId, profile.rdcRole);
  };

  const handleQuitControlByUserId = (userId: string) => {
    const profile = profiles.find((p) => p.userId === userId);
    if (!profile) {
      return;
    }
    rdcEngine.quitControl(profile.userId, profile.rdcRole, profile.screenStreamId);
  };

  const handleTakeControl = (userId: string) => {
    const profile = profiles.find((p) => p.userId === userId);
    const attachEl = document.querySelector<HTMLDivElement>('#control-area');
    if (!profile || !attachEl) {
      return;
    }
    rdcEngine.takeControl(profile.userId, profile.screenStreamId, attachEl);
  };

  const handleRequestControl = (el: HTMLButtonElement) => {
    const userId = el.getAttribute('data-userId');
    const profile = profiles.find((p) => p.userId === userId);
    if (!profile) {
      return;
    }
    rdcEngine.requestControl(profile.userId);
  };

  const handleQuitControl = (el: HTMLButtonElement) => {
    const userId = el.getAttribute('data-userId');
    if (!userId) {
      return;
    }
    handleQuitControlByUserId(userId);
  };

  const bindEvents = () => {
    rtcEngine.on('user-joined', handleUserJoin);
    rtcEngine.on('user-left', handleUserLeft);
    rdcEngine.on('rdc-request-control-authorized', handleTakeControl);
  };

  const bindDOMEvents = () => {
    document.querySelectorAll<HTMLButtonElement>('.request-control').forEach((el) => {
      el.addEventListener('click', () => handleRequestControl(el));
    });
    document.querySelectorAll<HTMLButtonElement>('.quit-control').forEach((el) => {
      el.addEventListener('click', () => handleQuitControl(el));
    });
  };

  const renderUserProfiles = (profiles: Profile[]) => {
    const userListEl = document.querySelector('#user-list');
    if (!userListEl) {
      return;
    }
    userListEl.innerHTML = `
    <ul>
        ${profiles
          .filter((profile) => profile.rdcRole === RDCRoleType.CONTROLLED)
          .map(
            (profile) =>
              `<li>
                <span>${profile.name}</span>
                <button class="request-control"  data-userId=${profile.userId}>Request Control</button>
                <button class="quit-control" data-userId=${profile.userId}>Quit Control</button>
            </li>`,
          )
          .join('')}
    </ul>
    `;
    bindDOMEvents();
  };

  bindEvents();
  rdcEngine.join(userId, userToken, channel, screenStreamId, screenStreamToken);
})();
