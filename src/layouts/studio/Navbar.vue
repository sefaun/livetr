<template>
  <div
    class="w-full h-[var(--studio-navbar-height)] bg-pink-200 dark:bg-slate-900 flex items-center justify-between px-4 shadow-md"
  >
    <div class="text-lg font-bold">{{ t('studio') }}</div>
    <div class="font-bold text-3xl text-[var(--primary-color)]">Livetr</div>
    <div class="flex items-center gap-2">
      <Theme />
      <Language />
      <ElButton :icon="Setting" @click.left="setStreamInformationModal(true)" circle></ElButton>
      <Live />
    </div>
  </div>
  <ElDialog
    v-model="streamInformationModal"
    :title="t('stream_info')"
    width="600px"
    @closed="setStreamInformationModal(false)"
  >
    <LiveOptions v-if="streamInformationModal" />
  </ElDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Theme from '@/components/Theme.vue'
import Language from '@/components/Language.vue'
import LiveOptions from '@/components/studio/navbar/LiveOptions.vue'
import Live from '@/components/studio/navbar/Live.vue'
import { ElButton, ElDialog } from 'element-plus'
import { Setting } from '@element-plus/icons-vue'

const { t } = useI18n()

const streamInformationModal = ref(false)

function setStreamInformationModal(value: boolean) {
  streamInformationModal.value = value
}
</script>
