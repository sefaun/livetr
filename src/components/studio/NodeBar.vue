<template>
  <div class="w-full h-full select-none">
    <ElTabs>
      <ElTabPane :label="t('text')">
        <Text />
      </ElTabPane>
      <ElTabPane :label="t('image')">
        <Image />
      </ElTabPane>
      <ElTabPane :label="t('video')">
        <Video />
      </ElTabPane>
      <ElTabPane :label="t('background')">
        <Background />
      </ElTabPane>
    </ElTabs>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ElTabs, ElTabPane } from 'element-plus'
import Text from '@/components/studio/nodebar/Text.vue'
import Image from '@/components/studio/nodebar/Image.vue'
import Video from '@/components/studio/nodebar/Video.vue'
import Background from '@/components/studio/nodebar/Background.vue'

const { t } = useI18n()
</script>
