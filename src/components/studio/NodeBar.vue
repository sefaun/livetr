<template>
  <div class="w-full h-full">
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
    </ElTabs>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ElTabs, ElTabPane } from 'element-plus'
import Text from '@/components/studio/nodebar/Text.vue'
import Image from '@/components/studio/nodebar/Image.vue'
import Video from '@/components/studio/nodebar/Video.vue'

const { t } = useI18n()
</script>
