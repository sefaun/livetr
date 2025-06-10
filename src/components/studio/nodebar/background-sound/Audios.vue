<template>
  <div class="w-full p-2 border border-gray-300 rounded-md">
    <div class="w-full flex justify-between gap-2">
      <div class="w-full flex gap-2">
        <div class="min-w-12 min-h-12">
          <audio
            ref="audioPlayerRef"
            :src="(props.data.data as TBackgroundSoundNodeData).src"
            @timeupdate="onTimeUpdate"
            @loadedmetadata="onLoadedMetadata"
            @ended="onEnded"
            @canplay="loaded(true)"
            @error="loaded(false)"
            preload="auto"
            class="hidden"
          ></audio>
          <div v-if="audioLoaded" class="h-full flex justify-center items-center">
            <ElIcon v-if="audioPlayableStatus" @click.left="play()" :size="25" class="cursor-pointer">
              <VideoPlay />
            </ElIcon>
            <ElIcon v-if="!audioPlayableStatus" @click.left="pause()" :size="25" class="cursor-pointer">
              <VideoPause />
            </ElIcon>
            <ElIcon v-if="!audioStatus" @click.left="rewind()" :size="25" class="cursor-pointer"><Refresh /></ElIcon>
          </div>
          <img v-else src="@/assets/sound-not-found.png" class="w-12 rounded-md" />
        </div>
        <div class="w-full flex items-center">
          {{ (props.data.data as TBackgroundSoundNodeData).title }}
        </div>
      </div>
      <div class="w-8 flex items-center gap-2">
        <ElPopconfirm
          :title="t('sure_for_delete')"
          :confirm-button-text="t('yes')"
          :cancel-button-text="t('no')"
          @confirm="removeNode()"
          placement="left-start"
          width="fit"
        >
          <template #reference>
            <ElButton :icon="Delete" @click.stop type="danger" circle></ElButton>
          </template>
        </ElPopconfirm>
      </div>
    </div>
    <div class="flex px-4 gap-4">
      <div class="w-full">
        <div class="text-xs">{{ t('time') }}: {{ formatTime }}</div>
        <ElSlider
          v-model="audioCurrentTime"
          :show-tooltip="false"
          :max="audioDuration"
          @input="onSliderStart($event as number)"
          @change="onSliderEnd($event as number)"
        />
      </div>
      <div class="w-full">
        <div class="text-xs">{{ t('sound') }}: {{ audioVolumePercentage }}%</div>
        <ElSlider
          :model-value="volume"
          :min="volumeOptions.min"
          :max="volumeOptions.max"
          :step="0.01"
          :show-tooltip="false"
          @input="changedVolume($event as number)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElButton, ElIcon, ElPopconfirm, ElSlider } from 'element-plus'
import { Delete, Refresh, VideoPause, VideoPlay } from '@element-plus/icons-vue'
import { useNodeAudio } from '@/composables/NodeAudio'
import { useFile } from '@/composables/File'
import { volumeOptions } from '@/enums'
import { removeDefaultNode } from '@/composables/utils'
import type { TBackgroundSoundNodeData, TNode } from '@/types'

const props = defineProps({
  data: {
    type: Object as PropType<TNode>,
    default: {},
    required: true,
  },
})

const { t } = useI18n()
const nodeAudio = useNodeAudio()
const file = useFile()

const audioPlayerRef = ref<HTMLAudioElement>()
const audioCurrentTime = ref(0)
const audioDuration = ref(0)
const volume = ref(1)
const audioPlayableStatus = ref(true)
const isSeeking = ref(false)
const audioLoaded = ref(false)

const audioStatus = computed(() => audioCurrentTime.value == 0)
const audioVolumePercentage = computed(() => ((volume.value * 100) / 1).toFixed())
const formatTime = computed(
  () =>
    `${Math.floor(audioCurrentTime.value / 60)
      .toString()
      .padStart(2, '0')}:${Math.floor(audioCurrentTime.value % 60)
      .toString()
      .padStart(2, '0')}`
)

async function play() {
  audioPlayableStatus.value = false
  await audioPlayerRef.value.play()
  if (!nodeAudio.getGainNode()) {
    nodeAudio.createAudioElementStream(audioPlayerRef.value)
    nodeAudio.start()
  }
  nodeAudio.getGainNode().gain.value = volume.value
}

function pause() {
  audioPlayableStatus.value = true
  audioPlayerRef.value.pause()
}

function rewind() {
  audioPlayableStatus.value = audioPlayerRef.value.paused
  audioPlayerRef.value.currentTime = 0
}

function onSliderStart(value: number) {
  isSeeking.value = true
  audioPlayerRef.value.pause()
  onSeek(value)
}

function onSliderEnd(_value: number) {
  isSeeking.value = false
  if (!audioPlayableStatus.value) {
    play()
  }
}

function onSeek(value: number) {
  audioPlayerRef.value.currentTime = value
  audioCurrentTime.value = value
}

function onTimeUpdate() {
  if (!isSeeking.value) {
    audioCurrentTime.value = audioPlayerRef.value.currentTime
  }
}

function onLoadedMetadata() {
  audioDuration.value = audioPlayerRef.value.duration
}

function onEnded() {
  audioPlayableStatus.value = true
  audioPlayerRef.value.currentTime = 0
  nodeAudio.destroy()
}

function changedVolume(value: number) {
  volume.value = value
  if (nodeAudio.getGainNode()) {
    nodeAudio.getGainNode().gain.value = value
  }
}

function loaded(value: boolean) {
  audioLoaded.value = value
}

function removeNode() {
  removeDefaultNode(props.data.id)
  file.setDefaultNodes()
}
</script>
