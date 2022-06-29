<script lang="ts" setup>
import { ref, watch, onBeforeUnmount, onMounted, h, shallowRef } from 'vue';
import { RDCRoleType, RDCDisplay } from 'agora-rdc-core';
import { message, Modal } from 'ant-design-vue';
import { PoweroffOutlined } from '@ant-design/icons-vue';
import { useSession } from '../../hooks/session';
import { useEngines } from '../../hooks/engines';
import { useProfiles } from '../../hooks/profiles';
import { useRDCDisplayConfiguration } from '../../hooks/options';
import Profiles from './Profiles.vue';
import { Profile } from '../../api';
import Observer from './Observer.vue';

const session = useSession();
const engines = ref(useEngines());
const profiles = useProfiles();
const rdcDisplayConfiguration = useRDCDisplayConfiguration();
const userIdsUnderObserving = ref<string[]>([]);
const visible = ref(false);
const activeKey = ref<string>();
const displays = shallowRef<RDCDisplay[]>([]);
const userIdControlledBy = ref<string>();

const handleObserve = (userId: string) => {
  userIdsUnderObserving.value = [...userIdsUnderObserving.value, userId];
};

const handleUnobserve = (userId: string, streamId: number) => {
  engines.value?.rdcEngine.unobserve(userId, streamId);
  userIdsUnderObserving.value = userIdsUnderObserving.value.filter((id) => id !== userId);
};

const handleRequestControl = async (userId: string) => {
  if (!engines.value) {
    return;
  }
  displays.value = await engines.value.rdcEngine.getDisplays();
  userIdControlledBy.value = userId;
  visible.value = true;
};

const handleQuitControl = (userId: string) => {
  if (!engines.value || !profiles.value || userIdControlledBy.value !== userId) {
    return;
  }
  const profile = profiles.value.find((p) => p.userId === userId);
  if (!profile) {
    return;
  }
  engines.value.rdcEngine.quitControl(userId, profile.rdcRole);
  message.destroy();
  message.info(`${profile.name} is released control.`);
  userIdControlledBy.value = undefined;
};

const declineRequest = () => {
  const profile = profiles.value?.find((profile) => {
    return profile.userId === userIdControlledBy.value;
  });
  if (!profile) {
    return;
  }
  visible.value = false;
  engines.value?.rdcEngine.unauthorizeControl(profile.userId);
  message.info(`You have been declined control request from ${profile.name}`);
  userIdControlledBy.value = undefined;
};

const handleAuthorize = (display: RDCDisplay) => {
  const profile = profiles.value?.find((profile) => profile.userId === userIdControlledBy.value);
  if (!userIdControlledBy.value || !engines.value || !profile) {
    return;
  }

  engines.value.rdcEngine.authorizeControl(userIdControlledBy.value, display, rdcDisplayConfiguration, true);
  visible.value = false;
  message.warn(
    h('span', {}, [
      h('span', {}, `Your computer is controlled by ${profile.name}.`),
      h(
        'a-button',
        {
          type: 'link',
          style: { marginLeft: '10px' },
          danger: true,
          onClick: () => doubleConfirm(profile),
        },
        h(PoweroffOutlined, { style: { color: 'red' } }),
      ),
    ]),
    0,
  );
};

const doubleConfirm = (profile: Profile) => {
  Modal.confirm({
    title: 'Are you sure to quit control?',
    content: `${profile.name} will not be able to control your computer anymore.`,
    okText: 'Yes',
    cancelText: 'No',
    onOk: () => {
      userIdControlledBy.value && handleQuitControl(userIdControlledBy.value);
    },
  });
};

watch([engines], () => {
  if (!engines.value) {
    return;
  }
  engines.value.rdcEngine.on('rdc-request-control', handleRequestControl);
  engines.value.rdcEngine.on('rdc-quit-control', handleQuitControl);
});
</script>

<template>
  <div v-if="session?.rdcRole === RDCRoleType.CONTROLLED">
    <a-tabs>
      <a-tab-pane
        v-for="profile of profiles?.filter((p) => userIdsUnderObserving.includes(p.userId))"
        :key="`${profile.userId}`"
        :tab="profile.name"
      >
      <Observer :userId="profile.userId" :streamId="profile.screenStreamId"/>
      </a-tab-pane>
    </a-tabs>
    <Profiles>
      <template #action="{ profile }">
        <a-tag v-if="profile.rdcRole === RDCRoleType.HOST" color="gold">HOST</a-tag>
        <span v-if="profile.rdcRole === RDCRoleType.CONTROLLED">
          <a-button
            type="link"
            @click="handleObserve(profile.userId)"
            :disabled="userIdsUnderObserving.includes(profile.userId)"
            >Start Observation</a-button
          >
          <a-divider type="vertical" />
          <a-button
            type="link"
            @click="handleUnobserve(profile.userId, profile.streamId)"
            :disabled="!userIdsUnderObserving.includes(profile.userId)"
            >Stop Observation</a-button
          >
        </span>
      </template>
    </Profiles>
    <a-modal
      title="Please click the screen which you want to authorize."
      :visible="visible"
      :footer="null"
      @cancel="declineRequest"
      :bodyStyle="{ padding: '8px' }"
    >
      <a-tabs v-model:activeKey="activeKey">
        <a-tab-pane
          v-for="(display, index) of displays"
          :tab="`Display: ${display.width} x ${display.height}`"
          :key="index"
        >
          <div style="height: 100%; width: 100%; cursor: pointer" @click="handleAuthorize(display)">
            <img style="max-height: 100%; max-width: 100%" :src="display.thumbnail" alt="display" />
          </div>
        </a-tab-pane>
      </a-tabs>
    </a-modal>
  </div>
</template>
