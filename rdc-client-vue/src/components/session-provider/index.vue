<script lang="ts">
import { defineComponent, provide, ref, watch } from 'vue';
import { asyncComputed } from '@vueuse/core';
import { App } from 'vue';
import { AxiosResponse } from 'axios';
import { fetchSession, Session } from '../../api';

const SessionProvider = defineComponent({
  name: 'rdc-session-provider',
  props: {
    userId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const asyncState = asyncComputed<AxiosResponse<Session> | undefined>(() => fetchSession(props.userId));
    const session = ref<Session | undefined>(undefined);
    watch(asyncState, (value) => {
      if (value) {
        session.value = value.data;
      }
    });
    provide('session', session);
  },
});

SessionProvider.install = function (app: App) {
  app.component(SessionProvider.name, SessionProvider);
};

export default SessionProvider;
</script>

<template>
  <div>
    <slot />
  </div>
</template>
