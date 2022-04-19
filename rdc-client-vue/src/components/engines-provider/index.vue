<script lang="ts">
import { App, defineComponent, provide, shallowRef, watch } from 'vue';
import { RDCRoleType } from 'agora-rdc-core';
import AgoraRtcEngine from 'agora-electron-sdk';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { AgoraRemoteDesktopControl as RDCEngineWithElectronRTC } from 'agora-rdc-electron';
import { AgoraRemoteDesktopControl as RDCEngineWithWebRTC } from 'agora-rdc-webrtc-electron';
import { useRDCEngineType, useRDCThresholdOptions } from '../../hooks/options';
import { useSession } from '../../hooks/session';
import { RTCEngine, RDCEngine, Engines } from '../../hooks/engines';

const isMacOS = navigator.userAgent.toLowerCase().indexOf('mac') >= 0;

const LOGS_FOLDER = isMacOS ? `${window.process.env.HOME}/Library/Logs/RDCClient` : '.';

const EnginesProvider = defineComponent({
  name: 'rdc-engines-provider',
  setup() {
    const rtcEngineType = useRDCEngineType();
    const session = useSession();
    const rdcOptions = useRDCThresholdOptions();
    const engines = shallowRef<Engines>();
    // initialize engines
    watch([session], () => {
      let rtcEngine: RTCEngine | undefined;
      let rdcEngine: RDCEngine | undefined;
      if (!session.value) {
        return;
      }
      const { appId, rdcRole } = session.value;
      if (rtcEngineType === 'electron') {
        rtcEngine = new AgoraRtcEngine();
        rtcEngine.initialize(appId, 1, {
          filePath: `${LOGS_FOLDER}/agora_rtc_sdk.log`,
          level: 1,
          fileSizeInKB: 2048,
        });
        rdcEngine = RDCEngineWithElectronRTC.create(rtcEngine, {
          role: rdcRole,
          appId,
          ...rdcOptions,
        });
      } else {
        rtcEngine = AgoraRTC.createClient({ role: 'host', mode: 'rtc', codec: 'av1' });
        rdcEngine = RDCEngineWithWebRTC.create(rtcEngine, {
          role: rdcRole,
          appId,
          ...rdcOptions,
        });
      }
      engines.value = {
        rtcEngine,
        rdcEngine,
      };
    });

    // join channel
    watch([session, engines], () => {
      if (!engines.value || !session.value) {
        return;
      }
      const { userId, userToken, channel, screenStreamId, screenStreamToken, cameraStreamId, cameraStreamToken } =
        session.value;
      engines.value.rdcEngine.join(userId, userToken, channel, screenStreamId, screenStreamToken);
      if (engines.value.rdcEngine.getRole() === RDCRoleType.HOST) {
        engines.value.rdcEngine.allowObservation();
      }

      if (rtcEngineType === 'electron' && engines.value.rtcEngine instanceof AgoraRtcEngine) {
        engines.value.rtcEngine.setChannelProfile(0);
        engines.value.rtcEngine.setClientRole(1);
        engines.value.rtcEngine.enableVideo();
        engines.value.rtcEngine.enableAudio();
        engines.value.rtcEngine.enableLocalAudio(
          engines.value.rdcEngine.getRole() === RDCRoleType.CONTROLLED ? true : false,
        );
        engines.value.rtcEngine.enableLocalVideo(false);
        engines.value.rtcEngine.joinChannel(cameraStreamToken, channel, '', cameraStreamId);
      }
      if (rtcEngineType === 'web') {
        // TODO: implements
      }
    });

    provide('engines', engines);
  },
});

EnginesProvider.install = function (app: App) {
  app.component(EnginesProvider.name, EnginesProvider);
};

export default EnginesProvider;
</script>
<template>
  <div><slot /></div>
</template>
