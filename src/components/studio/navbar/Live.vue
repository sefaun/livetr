<template>
  <div class="mx-3">
    <ElTooltip
      :content="live.getLiveStatus() == liveConnectionTypes.connect ? t('start_live') : t('end_live')"
      :hide-after="0"
      effect="dark"
      placement="bottom"
    >
      <ElButton
        :type="live.getLiveStatus() == liveConnectionTypes.connect ? 'success' : 'danger'"
        @click.left="live.getLiveStatus() == liveConnectionTypes.connect ? live.startStream() : live.endStream()"
        size="large"
        circle
      >
        <ElIcon :size="27" :class="live.getLiveStatus() == liveConnectionTypes.connecting ? 'is-loading' : ''">
          <VideoCameraFilled v-if="live.getLiveStatus() == liveConnectionTypes.connect" />
          <Loading v-if="live.getLiveStatus() == liveConnectionTypes.connecting" />
          <SwitchButton v-if="live.getLiveStatus() == liveConnectionTypes.connected" />
        </ElIcon>
      </ElButton>
    </ElTooltip>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ElButton, ElIcon, ElTooltip } from 'element-plus'
import { Loading, SwitchButton, VideoCameraFilled } from '@element-plus/icons-vue'
import { useLive } from '@/composables/Live'
import { liveConnectionTypes } from '@/enums'

const { t } = useI18n()
const live = useLive()
</script>
