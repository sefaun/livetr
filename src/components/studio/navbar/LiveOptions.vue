<template>
  <div class="space-y-2">
    <div class="flex gap-2">
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
    <div class="flex gap-2">
      <div class="basis-1/4">FPS:</div>
      <div class="basis-3/4 flex justify-start">
        <ElSelect v-model="fpsData" @change="changedFPS()" class="!w-36">
          <ElOption v-for="item in fps" :key="item" :label="item" :value="item" />
        </ElSelect>
      </div>
    </div>
    <div class="flex gap-2">
      <div class="basis-1/4">{{ t('stream_key') }}:</div>
      <div class="basis-3/4 flex justify-start">
        <ElInput v-model="key" @input="changedKey" show-password />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElInput, ElSelect, ElOption } from 'element-plus'
import { useLive } from '@/composables/Live'
import { channel } from '@/state'
import { channelRTMP, channels, fps } from '@/enums'

const { t } = useI18n()
const live = useLive()
const key = ref('')
const fpsData = ref(live.getLiveOptions().fps)

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

onMounted(() => {
  key.value = localStorage.getItem(import.meta.env.VITE_RTMP_KEY) ?? ''
})
</script>
