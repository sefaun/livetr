<template>
  <div class="space-y-2">
    <ElAlert v-if="!isDesktop" :title="t('desktop_only')" type="warning" :closable="false" show-icon class="!mb-3" />
    <div class="flex items-center gap-2">
      <div class="basis-1/4">{{ t('channel') }}:</div>
      <div class="basis-3/4 flex justify-start">
        <ElSelect
          :model-value="channel"
          :placeholder="t('select_channel')"
          @change="changedChannel($event)"
          class="!w-36"
        >
          <ElOption
            v-for="item in Object.values(channels)"
            :key="item"
            :label="item == channels.custom ? t('custom') : item.charAt(0).toLocaleUpperCase() + item.substring(1)"
            :value="item"
          />
        </ElSelect>
      </div>
    </div>
    <div v-if="channel == channels.custom" class="flex items-center gap-2">
      <div class="basis-1/4">{{ t('server_url') }}:</div>
      <div class="basis-3/4 flex flex-col justify-start">
        <ElInput v-model="rtmpURL" @input="changedRTMP" placeholder="rtmp://" />
        <div v-if="rtmpURL.trim() && !isValidServerUrl(rtmpURL)" class="text-xs text-red-500 mt-1">
          {{ t('invalid_rtmp_url') }}
        </div>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <div class="basis-1/4">{{ t('stream_key') }}:</div>
      <div class="basis-3/4 flex justify-start">
        <ElInput v-model="key" @input="changedKey" show-password />
      </div>
    </div>
    <div class="flex items-center gap-2">
      <div class="basis-1/4">{{ t('resolution') }}:</div>
      <div class="basis-3/4 flex justify-start">
        <ElSelect v-model="resolution" @change="changedResolution()" class="!w-36">
          <ElOption v-for="[name, value] in Object.entries(resolutions)" :key="name" :label="name" :value="value" />
        </ElSelect>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <div class="basis-1/4">FPS:</div>
      <div class="basis-3/4 flex justify-start">
        <ElSelect v-model="fpsData" @change="changedFPS()" class="!w-36">
          <ElOption v-for="item in fps" :key="item" :label="item" :value="item" />
        </ElSelect>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <div class="basis-1/4">{{ t('record_stream') }}:</div>
      <div class="basis-3/4 flex items-center justify-start gap-2">
        <ElSwitch v-model="record" :disabled="!isDesktop" @change="changedRecord()" />
        <span class="text-xs opacity-75">{{ t('record_stream_hint') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElAlert, ElInput, ElOption, ElSelect, ElSwitch } from 'element-plus'
import { isDesktop } from '@/platform'
import { useLive } from '@/composables/Live'
import { isValidServerUrl } from '@/composables/utils'
import { channel } from '@/state'
import { channels, fps, resolutions } from '@/enums'
import type { TChannels } from '@/types'

const { t } = useI18n()
const live = useLive()

const rtmpURL = ref(live.getLiveOptions().rtmp)
const key = ref(live.getLiveOptions().rtmpKey)
const fpsData = ref(live.getLiveOptions().fps)
const resolution = ref(live.getLiveOptions().resolution)
const record = ref(live.getLiveOptions().record)

function changedChannel(value: TChannels) {
  live.setChannel(value)
}

function changedRTMP(value: string) {
  live.setLiveOptions({
    rtmp: value.trim(),
  })
}

function changedFPS() {
  live.setLiveOptions({
    fps: fpsData.value,
  })
}

function changedKey() {
  live.setLiveOptions({
    rtmpKey: key.value.trim(),
  })
}

function changedResolution() {
  live.setLiveOptions({
    resolution: resolution.value,
  })
}

function changedRecord() {
  live.setLiveOptions({
    record: record.value,
  })
}
</script>
