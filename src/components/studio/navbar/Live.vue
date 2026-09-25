<template>
  <div class="mx-3">
    <ElTooltip :content="tooltip" :hide-after="0" effect="dark" placement="bottom">
      <ElButton
        :type="idle ? 'success' : 'danger'"
        :disabled="status == liveConnectionTypes.disconnecting"
        @click.left="idle ? live.startStream() : live.endStream()"
        size="large"
        circle
      >
        <ElIcon :size="27" :class="busy ? 'is-loading' : ''">
          <VideoCameraFilled v-if="idle" />
          <Loading v-if="busy" />
          <SwitchButton v-if="status == liveConnectionTypes.connected" />
        </ElIcon>
      </ElButton>
    </ElTooltip>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElButton, ElIcon, ElTooltip } from 'element-plus'
import { Loading, SwitchButton, VideoCameraFilled } from '@element-plus/icons-vue'
import { useLive } from '@/composables/Live'
import { liveConnectionTypes } from '@/enums'

const { t } = useI18n()
const live = useLive()

const status = computed(() => live.getLiveStatus())
const idle = computed(() => status.value == liveConnectionTypes.connect)
const busy = computed(
  () => status.value == liveConnectionTypes.connecting || status.value == liveConnectionTypes.disconnecting
)
const tooltip = computed(() => {
  if (idle.value) {
    return t('start_live')
  }

  return status.value == liveConnectionTypes.disconnecting ? t('stream_stopping') : t('end_live')
})
</script>
