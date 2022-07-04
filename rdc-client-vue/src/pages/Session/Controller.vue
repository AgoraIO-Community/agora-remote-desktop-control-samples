<script lang="ts" setup>
import { ref, watch, defineProps } from 'vue';
import { useWindowSize } from '@vueuse/core';
import { FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons-vue';
import { useEngines } from '../../hooks/engines';

const props = defineProps<{
  userId: string;
  streamId: number;
}>();
const attachRef = ref<HTMLDivElement | null>(null);
const engines = ref(useEngines());
const { width, height } = useWindowSize();
const isFullscreen = ref(false);

const handleFullScreen = () => {
  if (!isFullscreen.value && engines.value?.rdcEngine && attachRef.value) {
    engines.value.rdcEngine.requestFullscreen(attachRef.value);
  }
  if (isFullscreen.value && engines.value?.rdcEngine) {
    engines.value.rdcEngine.exitFullscreen();
  }
};

watch([engines, props, attachRef], () => {
  if (!engines.value || !attachRef.value) {
    return;
  }
  engines.value.rdcEngine.takeControl(props.userId, props.streamId, attachRef.value);
  engines.value.rdcEngine.once('rdc-fullscreen-change', (iFS: boolean) => (isFullscreen.value = iFS));
});
</script>

<template>
  <div className="rdc-client-screen-wrap">
    <div className="rdc-screen" ref="attachRef" :style="{ height: `${height - 56}px`, width: `${width}px` }" />
    <div className="control-bar">
      <a-button type="primary" shape="circle" @Click="handleFullScreen">
        <template #icon>
          <FullscreenExitOutlined v-if="isFullscreen" />
          <FullscreenOutlined v-if="!isFullscreen" />
        </template>
      </a-button>
    </div>
  </div>
</template>
