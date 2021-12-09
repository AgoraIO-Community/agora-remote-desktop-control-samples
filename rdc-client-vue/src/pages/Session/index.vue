<script lang="ts" setup>
import { useRoute } from 'vue-router';
import Channel from './Channel.vue';
import Host from './Host.vue';
import Controlled from './Controlled.vue';

const router = useRoute();
const userId = router.params.userId as string;
</script>

<template>
  <rdc-session-provider :userId="userId">
    <rdc-engines-provider>
      <rdc-profiles-provider :userId="userId">
        <div class="rdc-client">
          <Host />
          <Controlled />
          <Channel />
        </div>
      </rdc-profiles-provider>
    </rdc-engines-provider>
  </rdc-session-provider>
</template>

<style>
.rdc-client {
  height: '100vh';
  width: '100vw';
  background-color: #000;
}

.rdc-client .ant-tabs-top > .ant-tabs-nav {
  margin: 0;
  background-color: #fff;
}
.rdc-client .ant-tabs-tab > .ant-tabs-tab-btn {
  padding: 0 8px;
}

.rdc-client .rdc-client-screen-wrap {
  position: relative;
  height: 100%;
  width: 100%;
  background-color: #000;
}

.rdc-client-screen-wrap .rdc-screen {
  margin: 3px 0;
}

.rdc-client-screen-wrap .control-bar {
  position: absolute;
  top: 5px;
  right: 10px;
}

.rdc-client .ant-spin-blur {
  opacity: 0.5;
}

.rdc-client .ant-spin-nested-loading > div > .ant-spin .ant-spin-text {
  text-shadow: none;
}
</style>
