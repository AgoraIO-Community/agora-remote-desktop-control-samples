import { RDCRoleType } from 'agora-rdc-webrtc-electron';
import { joinSession } from './api';

(() => {
  type State = {
    role: RDCRoleType;
    channel: string;
    name: string;
  };
  const state: Partial<State> = {};

  const handleRoleChange = () => {
    const el: HTMLSelectElement | null = document.querySelector('#role');
    if (!el) {
      return;
    }
    state.role = Number(el.value);
  };

  const handleChannelInput = () => {
    const el: HTMLSelectElement | null = document.querySelector('#channel');
    if (!el) {
      return;
    }
    state.channel = el.value;
  };

  const handleNameInput = () => {
    const el: HTMLSelectElement | null = document.querySelector('#name');
    if (!el) {
      return;
    }
    state.name = el.value;
  };

  const handleSubmit = (event: Event) => {
    event.preventDefault();
    const { role, channel, name } = state;
    const noticeEl = document.createElement('div');
    noticeEl.setAttribute('class', 'notice');
    const formEl = document.querySelector('form');

    const shoudleRemoveNoticeEl = document.querySelector('.notice');
    if (shoudleRemoveNoticeEl) {
      shoudleRemoveNoticeEl.remove();
    }
    if (!formEl) {
      return;
    }
    if (!role) {
      noticeEl.innerText = 'Please select role!';
      formEl.before(noticeEl);
      return;
    }
    if (!channel) {
      noticeEl.innerText = 'Please input channel!';
      formEl.before(noticeEl);
      return;
    }
    if (!name) {
      noticeEl.innerText = 'Please input name!';
      formEl.before(noticeEl);
      return;
    }
    joinSession({
      channel,
      name,
      role,
    }).then(({ data: { userId } }) => {
      if (role === RDCRoleType.HOST) {
        window.location.assign(`host.html?userId=${userId}`);
      }
      if (role === RDCRoleType.CONTROLLED) {
        window.location.assign(`controlled.html?userId=${userId}`);
      }
    });
  };

  const bindEvents = () => {
    const roleEl: HTMLSelectElement | null = document.querySelector('#role');
    const channelEl: HTMLInputElement | null = document.querySelector('#channel');
    const nameEl: HTMLInputElement | null = document.querySelector('#name');
    const submitEl: HTMLButtonElement | null = document.querySelector('#submit');
    if (!roleEl || !channelEl || !nameEl || !submitEl) {
      return;
    }
    roleEl.addEventListener('change', handleRoleChange);
    channelEl.addEventListener('input', handleChannelInput);
    nameEl.addEventListener('input', handleNameInput);
    submitEl.addEventListener('click', handleSubmit);
  };

  bindEvents();
})();
