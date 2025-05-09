<template>
  <div class="space-y-2">
    <div class="flex items-center gap-2">
      <div class="basis-1/4">{{ t('channel') }}:</div>
      <div class="basis-3/4 flex justify-start">
        <ElSelect v-model="channel" :placeholder="t('select_channel')" @change="changedChannel()" class="!w-36">
          <ElOption
            v-for="item in Object.values(channels)"
            :key="item"
            :label="item.charAt(0).toLocaleUpperCase() + item.substring(1)"
            :value="item"
          />
        </ElSelect>
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
          <ElOption v-for="[key, value] in Object.entries(resolutions)" :key="key" :label="key" :value="value" />
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElInput, ElSelect, ElOption } from 'element-plus'
import { useLive } from '@/composables/Live'
import { channel } from '@/state'
import { channelRTMP, channels, fps, resolutions } from '@/enums'

const { t } = useI18n()
const live = useLive()

const key = ref(live.getLiveOptions().rtmpKey)
const fpsData = ref(live.getLiveOptions().fps)
const resolution = ref(live.getLiveOptions().resolution)

function changedChannel() {
  localStorage.setItem(import.meta.env.VITE_CHANNEL, channel.value)

  live.setLiveOptions({
    rtmp: channelRTMP[channel.value],
  })
}

function changedFPS() {
  localStorage.setItem(import.meta.env.VITE_STREAM_FPS, fpsData.value.toString())

  live.setLiveOptions({
    fps: fpsData.value,
  })
}

function changedKey() {
  localStorage.setItem(import.meta.env.VITE_RTMP_KEY, key.value)

  live.setLiveOptions({
    rtmpKey: key.value,
  })
}

function changedResolution() {
  localStorage.setItem(import.meta.env.VITE_STREAM_RESOLUTION, resolution.value)

  live.setLiveOptions({
    resolution: resolution.value,
  })
}
</script>
