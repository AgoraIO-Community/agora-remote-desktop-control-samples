<script lang="ts" setup>
import { ref } from 'vue';
import { UserOutlined } from '@ant-design/icons-vue';
import { useProfiles } from '../../hooks/profiles';

const visible = ref(true);
const profiles = useProfiles();

const toggleVisible = () => {
  visible.value = !visible.value;
};
</script>
<template>
  <a-drawer
    :closable="false"
    :width="500"
    :placement="'right'"
    :mask-closable="true"
    :destroy-on-close="true"
    :visible="visible"
    @close="toggleVisible"
  >
    <a-list item-layout="horizontal" :data-source="profiles">
      <template #renderItem="{ item }">
        <a-list-item>
          <div>
            <span style="margin-right: 10px">{{ item.name }}</span>
            <slot name="action" :profile="item"></slot>
          </div>
        </a-list-item>
      </template>
    </a-list>
  </a-drawer>
  <a-affix style="position: absolute; right: 10px; bottom: 20px">
    <a-button type="primary" shape="circle" @click="toggleVisible">
      <template #icon><UserOutlined /></template>
    </a-button>
  </a-affix>
</template>
