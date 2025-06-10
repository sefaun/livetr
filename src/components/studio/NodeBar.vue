<template>
  <div ref="nodeBarRef" class="w-full h-full select-none">
    <div class="flex justify-end items-center">
      <ElButton :icon="Refresh" :loading="!isOpen" @click.left="refreshNodeBar()" size="small">
        {{ t('refresh') }}
      </ElButton>
    </div>
    <ElTabs v-if="isOpen" v-model="activeTab">
      <!-- <ElTabPane :label="t('text')" name="text">
        <Text />
      </ElTabPane> -->
      <ElTabPane :label="t('image')" name="image">
        <Image />
      </ElTabPane>
      <ElTabPane :label="t('video')" name="video">
        <Video />
      </ElTabPane>
      <ElTabPane :label="t('background')" name="background">
        <Background />
      </ElTabPane>
      <ElTabPane :label="t('background_sound')" name="backgroundSound">
        <BackgroundSound />
      </ElTabPane>
    </ElTabs>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElTabs, ElTabPane, ElButton, ElLoading } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
// import Text from '@/components/studio/nodebar/Text.vue'
import Image from '@/components/studio/nodebar/Image.vue'
import Video from '@/components/studio/nodebar/Video.vue'
import Background from '@/components/studio/nodebar/Background.vue'
import BackgroundSound from '@/components/studio/nodebar/BackgroundSound.vue'

const { t } = useI18n()

const nodeBarRef = ref<HTMLDivElement>()
const isOpen = ref(true)
const activeTab = ref('image')

function refreshNodeBar() {
  const loading = ElLoading.service({
    target: nodeBarRef.value,
  })

  isOpen.value = false

  nextTick(() => {
    isOpen.value = true
    setTimeout(() => {
      loading.close()
    }, 500)
  })
}
</script>
