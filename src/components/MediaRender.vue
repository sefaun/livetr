<template>
  <div class="w-full h-full">
    <component
      v-show="loadStatus"
      v-on="$attrs"
      :is="props.type"
      :class="props.mediaClass"
      :src="props.src"
      @load="loaded(true)"
      @error="loaded(false)"
      class="w-full h-full"
    />
    <div
      v-show="!loadStatus"
      class="w-full h-full flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md"
    >
      <ElIcon :size="props.iconSize" :color="props.iconColor">
        <Camera v-if="props.type == mediaTypes.img" />
        <VideoPlay v-if="props.type == mediaTypes.video" />
      </ElIcon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { PropType } from 'vue'
import { VideoPlay, Camera } from '@element-plus/icons-vue'
import { ElIcon } from 'element-plus'
import { mediaTypes } from '@/enums'
import type { TMediaTypes } from '@/types'

const props = defineProps({
  type: {
    type: String as PropType<TMediaTypes>,
    default: 'img',
  },
  src: {
    type: String,
    default: '',
    required: true,
  },
  iconSize: {
    type: Number,
    default: 24,
  },
  iconColor: {
    type: String,
    default: '',
  },
  mediaClass: {
    type: String,
    default: '',
  },
})

const loadStatus = ref(true)

function loaded(value: boolean) {
  loadStatus.value = value
}
</script>
