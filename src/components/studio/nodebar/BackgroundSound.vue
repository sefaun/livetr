<template>
  <div class="space-y-4">
    <div class="w-full">
      <ElButton :icon="Plus" @click.left="nodeBar.setBackgroundSoundStore()" type="success" class="w-full">
        {{ t('add') }}
      </ElButton>
    </div>
    <div class="w-full space-y-1">
      <Audios v-for="node of nodes" :key="node.id" :data="node"></Audios>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElButton } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { Plus } from '@element-plus/icons-vue'
import { useNodeBar } from '@/composables/NodeBar'
import { defaultNodes } from '@/state'
import { screenNodeTypes } from '@/enums'
import Audios from '@/components/studio/nodebar/background-sound/Audios.vue'

const { t } = useI18n()
const nodeBar = useNodeBar()

const nodes = computed(() => defaultNodes.value.filter((item) => item.type == screenNodeTypes.backgroundSound))
</script>
