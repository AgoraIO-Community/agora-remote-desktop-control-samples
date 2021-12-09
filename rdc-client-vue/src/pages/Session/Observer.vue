<script lang="ts">
export default {
  props: {
    userId: {
      type: String,
      required: true,
    },
    streamId: {
      type: Number,
      required: true,
    },
  },
};
</script>

<script lang="ts" setup>
import { ref, watch, defineProps } from 'vue';
import { useWindowSize } from '@vueuse/core';
import { useEngines } from '../../hooks/engines';

const attachRef = ref<HTMLDivElement | null>(null);
const engines = ref(useEngines());
const props = defineProps<{
  userId: string;
  streamId: number;
}>();
const { width, height } = useWindowSize();

watch([engines, props, attachRef], () => {
  if (!engines.value || !attachRef.value) {
    return;
  }
  engines.value.rdcEngine.observe(props.userId, props.streamId, attachRef.value);
});
</script>

<template>
  <div className="rdc-client-screen-wrap">
    <div className="rdc-screen" ref="attachRef" :style="{ height: `${height - 56}px`, width: `${width}px` }" />
  </div>
</template>
