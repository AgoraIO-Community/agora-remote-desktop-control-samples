<script lang="ts" setup>
import { ref, watch, onBeforeUnmount, onMounted, h } from 'vue';
import { message } from 'ant-design-vue';
import { LoadingOutlined } from '@ant-design/icons-vue';
import { RDCRemotelyPastingCodes, RDCRemotelyPastingStatus, RDCRoleType } from 'agora-rdc-core';
import { Profile } from '../../api';
import { useSession } from '../../hooks/session';
import { useEngines } from '../../hooks/engines';
import { useProfiles } from '../../hooks/profiles';
import Profiles from './Profiles.vue';
import Controller from './Controller.vue';

const PASTE_REMOTELY_REASON: { [k: number]: string } = {
  [RDCRemotelyPastingCodes.CONCURRENCY_LIMIT_EXCEEDED]: 'concurrency limit exceeded.',
  [RDCRemotelyPastingCodes.SIZE_OVERFLOW]: 'max file size is 30MB.',
  [RDCRemotelyPastingCodes.TIMEOUT]: 'transmission timeout.',
  [RDCRemotelyPastingCodes.UNSUPPORTED_FILE_TYPE]: 'pasting folder is not supported.',
};

const session = useSession();
const engines = ref(useEngines());
const profiles = useProfiles();
const userIdsUnderControl = ref<string[]>([]);
const pasting = ref(false);

const indicator = h(LoadingOutlined, {
  style: {
    fontSize: '24px',
  },
  spin: true,
});

const handleRequestControlAuthorized = (userId: string) => {
  userIdsUnderControl.value = [...userIdsUnderControl.value, userId];
};

const handleRequestControlUnauthorized = (userId: string) => {
  const profile = profiles.value?.find((p) => p.userId === userId);
  if (profile) {
    message.warn(`${profile.name} is declined your request`);
  }
};

const handleQuitControlEvent = (userId: string) => {
  userIdsUnderControl.value = userIdsUnderControl.value.filter((userIdUC) => userIdUC !== userId);
};

const handleRemotePaste = (status: RDCRemotelyPastingStatus, code: RDCRemotelyPastingCodes) => {
  if (status === RDCRemotelyPastingStatus.STARTING && code === RDCRemotelyPastingCodes.SUCCEEDED) {
    pasting.value = true;
    return;
  }

  if (status === RDCRemotelyPastingStatus.SUCCEEDED && code === RDCRemotelyPastingCodes.SUCCEEDED) {
    pasting.value = false;
    message.success('File is pasted.');
    return;
  }

  if (status === RDCRemotelyPastingStatus.FAILED) {
    message.error(`Failed to pasting file, cause ${PASTE_REMOTELY_REASON[code as number]}`);
    pasting.value = false;
    return;
  }
};

const handleRequestControl = (profile: Profile) => {
  engines.value?.rdcEngine.requestControl(profile.userId);
  message.success(`Control request has been sent to ${name}.`);
};

const handleQuitControl = (profile: Profile) => {
  engines.value?.rdcEngine.quitControl(profile.userId, profile.rdcRole, profile.screenStreamId);
};

const handleBeforeunload = () => {
  profiles.value
    ?.filter((p) => userIdsUnderControl.value.includes(p.userId))
    .forEach(({ userId, rdcRole }) => engines.value?.rdcEngine.quitControl(userId, rdcRole));
  engines.value?.rdcEngine.leave();
  engines.value?.rdcEngine.dispose();
};

watch([engines], () => {
  if (!engines.value) {
    return;
  }
  engines.value.rdcEngine.on('rdc-request-control-authorized', handleRequestControlAuthorized);
  engines.value.rdcEngine.on('rdc-request-control-unauthorized', handleRequestControlUnauthorized);
  engines.value.rdcEngine.on('rdc-quit-control', handleQuitControlEvent);
  engines.value.rdcEngine.on('rdc-remote-paste', handleRemotePaste);
});

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeunload);
});
onBeforeUnmount(() => {
  if (!engines.value) {
    return;
  }
  engines.value.rdcEngine.off('rdc-request-control-authorized', handleRequestControlAuthorized);
  engines.value.rdcEngine.off('rdc-request-control-unauthorized', handleRequestControlUnauthorized);
  engines.value.rdcEngine.off('rdc-quit-control', handleQuitControlEvent);
  engines.value.rdcEngine.off('rdc-remote-paste', handleRemotePaste);
  handleBeforeunload();
  window.removeEventListener('beforeunload', handleBeforeunload);
});
</script>

<template>
  <div v-if="session?.rdcRole === RDCRoleType.HOST">
    <a-tabs>
      <a-tab-pane
        v-for="profile of profiles?.filter((p) => userIdsUnderControl.includes(p.userId))"
        :key="`${profile.userId}`"
        :tab="profile.name"
      >
        <a-spin :spinning="pasting" tip="File is pasting..." :indicator="indicator">
          <Controller :userId="profile.userId" :streamId="profile.screenStreamId" />
        </a-spin>
      </a-tab-pane>
    </a-tabs>
    <Profiles>
      <template #action="{ profile }">
        <a-button
          type="link"
          @click="handleRequestControl(profile)"
          :disabled="userIdsUnderControl.includes(profile.userId)"
          >Request Control</a-button
        >
        <a-divider type="vertical" />
        <a-button
          type="link"
          @click="handleQuitControl(profile)"
          :disabled="!userIdsUnderControl.includes(profile.userId)"
          >Quit Control</a-button
        >
      </template>
    </Profiles>
  </div>
</template>
