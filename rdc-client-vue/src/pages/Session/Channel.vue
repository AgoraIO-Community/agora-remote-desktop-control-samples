<script setup lang="ts">
import { useSession } from '../../hooks/session';

const session = useSession();
</script>

<template lang="html">
  <div className="channel">CHANNEL: {{ session?.channel }}</div>
</template>

<style lang="css" scoped>
.channel {
  position: fixed;
  display: inline-block;
  bottom: 2px;
  left: 2px;
  border-radius: 4px;
  padding: 4px 8px;
  color: #1890ff;
  background-color: rgba(0, 0, 0, 0.3);
}
</style>
