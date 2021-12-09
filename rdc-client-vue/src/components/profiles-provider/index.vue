<script lang="ts">
import { defineComponent, watch, App, ref, provide } from 'vue';
import AgoraRtcEngine from 'agora-electron-sdk';
import { IAgoraRTCClient, IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';
import { useAsyncState } from '@vueuse/core';
import { useRDCEngineType } from '../../hooks/options';
import { useEngines } from '../../hooks/engines';
import { useSession } from '../../hooks/session';
import { Profile, fetchProfiles } from '../../api';

const ProfilesProvider = defineComponent({
  name: 'rdc-profiles-provider',
  props: {
    userId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const rtcEngineType = useRDCEngineType();
    const session = useSession();
    const engines = ref(useEngines());
    const profiles = ref<Profile[]>([]);
    const screenStreamIds = ref<number[]>([]);
    const { execute, state } = useAsyncState(fetchProfiles(props.userId), null);

    const getStreamId = (streamIdentifier: number | IAgoraRTCRemoteUser, screenStreamId?: number) => {
      let streamId: number | undefined;
      // handle for agora-rtc-sdk-ng;
      if (typeof streamIdentifier === 'number') {
        streamId = streamIdentifier;
      }
      // handle for agora-electron-sdk <= 3.5.1 && >= 2.8.0
      if (typeof streamIdentifier === 'object' && typeof screenStreamId === 'undefined') {
        const remoteUser = streamIdentifier as IAgoraRTCRemoteUser;
        streamId = remoteUser.uid as number;
      }
      // handle for agora-electron-sdk >= 3.6.0
      if (typeof streamIdentifier === 'object' && typeof screenStreamId === 'number') {
        streamId = screenStreamId;
      }
      return streamId;
    };

    const handleStreamJoined = (streamIdentifier: number | IAgoraRTCRemoteUser, screenStreamId?: number) => {
      const streamId = getStreamId(streamIdentifier, screenStreamId);
      if (!streamId || screenStreamIds.value.includes(streamId) || session.value?.screenStreamId === streamId) {
        return;
      }
      screenStreamIds.value = [...screenStreamIds.value, streamId];
    };

    const handleStreamLeft = (streamIdentifier: number | IAgoraRTCRemoteUser, screenStreamId?: number) => {
      const streamId = getStreamId(streamIdentifier, screenStreamId);
      if (!streamId || !screenStreamIds.value.includes(streamId)) {
        return;
      }
      screenStreamIds.value = screenStreamIds.value.filter((id) => id !== streamId);
      console.log('stream left', screenStreamIds.value);
    };

    watch([engines], () => {
      if (!engines.value) {
        return;
      }
      engines.value;
      if (rtcEngineType === 'electron' && engines.value.rtcEngine instanceof AgoraRtcEngine) {
        engines.value.rtcEngine.on('userJoined', handleStreamJoined);
        engines.value.rtcEngine.on('removeStream', handleStreamLeft);
      }
      if (rtcEngineType === 'web') {
        (engines.value.rtcEngine as IAgoraRTCClient).on('user-joined', handleStreamJoined);
        (engines.value.rtcEngine as IAgoraRTCClient).on('user-left', handleStreamLeft);
      }
    });

    watch([screenStreamIds], () => execute());

    watch([screenStreamIds, state], () => {
      if (!state.value) {
        return;
      }
      profiles.value = state.value.data.filter((profile) => screenStreamIds.value.includes(profile.screenStreamId));
    });

    provide('profiles', profiles);
  },
});

export default ProfilesProvider;

ProfilesProvider.install = function (app: App) {
  app.component(ProfilesProvider.name, ProfilesProvider);
};
</script>

<template>
  <div>
    <slot />
  </div>
</template>
