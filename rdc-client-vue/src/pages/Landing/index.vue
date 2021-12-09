<script setup lang="ts">
import { reactive, ref } from 'vue';
import { Form } from 'ant-design-vue';
import { SettingOutlined } from '@ant-design/icons-vue';
import { RDCRoleType } from 'agora-rdc-core';
import { useRouter } from 'vue-router';
import { useLocalStorage } from '@vueuse/core';
import { joinSession, JoinSessionParams } from '../../api';
import { HostOptions, ControlledOptions } from '../../interfaces';
import { RESOLUTION_BITRATE } from '../../constants';
import { FRAME_RATES } from '../../../../rdc-client/src/constants';

const DEFAULT_HOST_OPTIONS: HostOptions = {
  mouseEventsThreshold: 30,
  keyboardEventsThreshold: 30,
  rtcEngineType: 'web',
};
const DEFAULT_CONTROLLED_OPTIONS: ControlledOptions = {
  resolutionBitrate: '1080p2000',
  rtcEngineType: 'web',
  frameRate: 60,
};

const useForm = Form.useForm;

const visible = ref<boolean>(false);
const toggleVisible = () => {
  visible.value = !visible.value;
};
const role = ref<RDCRoleType | undefined>();
const router = useRouter();
const hostOptsStorage = useLocalStorage('RDC_HOST_OPTS', DEFAULT_HOST_OPTIONS);
const controlledOptsStorage = useLocalStorage('RDC_CONTROLLED_OPTS', DEFAULT_CONTROLLED_OPTIONS);

const hostOptsModelRef = reactive({ ...hostOptsStorage.value });
const hostOptsFormRules = reactive({
  rtcEngineType: [
    {
      required: true,
      message: 'Please select role',
    },
  ],
  mouseEventsThreshold: [
    {
      required: true,
      message: 'Please input mouse events threshold',
    },
  ],
  keyboardEventsThreshold: [
    {
      required: true,
      message: 'Please input keyboard events threshold',
    },
  ],
});
const hostOptsForm = useForm(hostOptsModelRef, hostOptsFormRules);

const resolutionBitrateOpts = Object.keys(RESOLUTION_BITRATE).map((k) => {
  const rb = RESOLUTION_BITRATE[k];
  return {
    label: `${rb.width} x ${rb.height}, ${rb.bitrate}Kbps`,
    value: k,
  };
});
const frameRateOpts = FRAME_RATES.map((rate) => ({
  label: `${rate} fps`,
  value: rate,
}));
const controlledOptsModelRef = reactive({ ...controlledOptsStorage.value });
const controlledOptsFormRules = reactive({
  rtcEngineType: {
    required: true,
    message: 'Please select RTC SDK',
  },
  resolutionBitrate: {
    required: true,
    message: 'Please select resolution and bitrate',
  },
  frameRate: [
    {
      required: true,
      message: 'Please select frame rate',
    },
  ],
});
const controlledOptsForm = useForm(controlledOptsModelRef, controlledOptsFormRules);

const handleOptsOk = async () => {
  if (role.value === RDCRoleType.HOST) {
    await hostOptsForm.validate();
    hostOptsStorage.value = hostOptsModelRef;
  }

  if (role.value === RDCRoleType.CONTROLLED) {
    await controlledOptsForm.validate();
    controlledOptsStorage.value = controlledOptsModelRef;
  }
  toggleVisible();
};

const roleOpts = [
  { label: 'Host', value: RDCRoleType.HOST },
  { label: 'Controlled', value: RDCRoleType.CONTROLLED },
];
const joiningModelRef = reactive<Partial<JoinSessionParams>>({});
const joiningFormRules = reactive({
  role: [
    {
      required: true,
      message: 'Please select role',
    },
  ],
  channel: [
    {
      required: true,
      message: 'Please input channel',
    },
  ],
  name: [
    {
      required: true,
      message: 'Please input name',
    },
  ],
});
const joiningForm = useForm(joiningModelRef, joiningFormRules);
const handleRoleChange = (value: RDCRoleType) => {
  role.value = value;
};
const handleJoin = async () => {
  const params = await joiningForm.validate<JoinSessionParams>();
  const {
    data: { userId },
  } = await joinSession(params);
  if (role.value === RDCRoleType.HOST) {
    const opts = { ...DEFAULT_HOST_OPTIONS, ...hostOptsModelRef };
    router.push(`/session/${userId}?opts=${window.btoa(JSON.stringify(opts))}`);
  }
  if (role.value === RDCRoleType.CONTROLLED) {
    const opts = { ...DEFAULT_CONTROLLED_OPTIONS, ...controlledOptsModelRef };
    router.push(`/session/${userId}?opts=${window.btoa(JSON.stringify(opts))}`);
  }
};
</script>

<template>
  <div>
    <a-affix style="position: absolute; right: 10px; top: 10px">
      <a-button shape="circle" type="dashed" @click="toggleVisible" :disabled="!role">
        <template #icon>
          <SettingOutlined />
        </template>
      </a-button>
    </a-affix>
    <a-modal title="RDC Options" v-model:visible="visible" @ok="handleOptsOk" :closable="false">
      <a-form :labelCol="{ span: 12 }" :style="{ display: role === RDCRoleType.HOST ? 'block' : 'none' }">
        <a-form-item label="RTC SDK" v-bind="hostOptsForm.validateInfos.rtcEngineType" required>
          <a-select v-model:value="hostOptsModelRef.rtcEngineType">
            <a-select-option value="electron">agora-sdk-electron</a-select-option>
            <a-select-option value="web">agora-rtc-sdk-ng</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          label="Mouse Events Threshold (ms)"
          v-bind="hostOptsForm.validateInfos.mouseEventsThreshold"
          required
        >
          <a-input-number
            style="width: 100%"
            v-model:value="hostOptsModelRef.mouseEventsThreshold"
            :min="0"
            :max="500"
            :step="10"
          />
        </a-form-item>
        <a-form-item
          label="Keyboard Events Threshold(ms)"
          v-bind="hostOptsForm.validateInfos.keyboardEventsThreshold"
          required
        >
          <a-input-number
            style="width: 100%"
            v-model:value="hostOptsModelRef.keyboardEventsThreshold"
            :min="0"
            :max="500"
            :step="10"
          />
        </a-form-item>
      </a-form>
      <a-form :labelCol="{ span: 12 }" :style="{ display: role === RDCRoleType.CONTROLLED ? 'block' : 'none' }">
        <a-form-item label="RTC SDK" v-bind="controlledOptsForm.validateInfos.rtcEngineType" required>
          <a-select v-model:value="controlledOptsModelRef.rtcEngineType">
            <a-select-option value="electron">agora-sdk-electron</a-select-option>
            <a-select-option value="web">agora-rtc-sdk-ng</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          label="Resolution and Bitrate"
          v-bind="controlledOptsForm.validateInfos.resolutionBitrate"
          required
        >
          <a-select :options="resolutionBitrateOpts" v-model:value="controlledOptsModelRef.resolutionBitrate" />
        </a-form-item>
        <a-form-item label="Frame Rate" v-bind="controlledOptsForm.validateInfos.frameRate" required>
          <a-select :options="frameRateOpts" v-model:value="controlledOptsModelRef.frameRate" />
        </a-form-item>
      </a-form>
    </a-modal>
    <a-form :label-col="{ span: 8 }" :wrapper-col="{ span: 8 }" style="margin-top: 160px">
      <a-form-item label="Role" v-bind="joiningForm.validateInfos.role" required>
        <a-select
          :options="roleOpts"
          v-model:value="joiningModelRef.role"
          style="width: 100%"
          @change="handleRoleChange"
        >
        </a-select>
      </a-form-item>
      <a-form-item label="Channel" v-bind="joiningForm.validateInfos.channel" required>
        <a-input v-model:value="joiningModelRef.channel"></a-input>
      </a-form-item>
      <a-form-item label="Name" v-bind="joiningForm.validateInfos.name" required>
        <a-input v-model:value="joiningModelRef.name"></a-input>
      </a-form-item>
      <a-form-item :wrapper-col="{ offset: 8, span: 8 }">
        <a-button type="primary" @click="handleJoin" block>JOIN</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<style scoped></style>
