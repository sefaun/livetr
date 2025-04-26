<template>
  <div class="mx-3">
    <ElTooltip :content="t('start_live')" :hide-after="0" effect="dark" placement="bottom">
      <ElButton @click.left="live.startStream()" type="danger" size="large" circle>
        <ElIcon :size="27"><VideoCameraFilled /></ElIcon>
      </ElButton>
    </ElTooltip>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ElButton, ElIcon, ElTooltip } from 'element-plus'
import { VideoCameraFilled } from '@element-plus/icons-vue'
import { useLive } from '@/composables/Live'

const { t } = useI18n()
const live = useLive()
</script>
