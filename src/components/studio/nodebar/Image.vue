<template>
  <div class="space-y-4">
    <div class="w-full">
      <ElButton :icon="Plus" @click.left="nodeBar.setImageStore(screenNodeTypes.image)" type="success" class="w-full">
        {{ t('add') }}
      </ElButton>
    </div>
    <div class="w-full space-y-1">
      <div
        v-for="node of nodes"
        :key="node.id"
        :id="node.id"
        @dragstart="dragdrop.dragstart($event, node)"
        draggable="true"
        class="w-full flex justify-between p-2 border border-gray-300 rounded-md cursor-move gap-2"
      >
        <div class="w-full flex gap-2">
          <div class="min-w-12 min-h-12">
            <NodeBarMediaRender
              :src="(node.data as TImageNodeData).src"
              class="w-12 h-12 rounded-md"
            />
          </div>
          <div class="w-full flex items-center">
            {{ (node.data as TImageNodeData).title }}
          </div>
        </div>
        <div class="w-8 flex items-center">
          <ElPopconfirm
            :title="t('sure_for_delete')"
            :confirm-button-text="t('yes')"
            :cancel-button-text="t('no')"
            @confirm="removeNode(node.id)"
            placement="left-start"
            width="fit"
          >
            <template #reference>
              <ElButton :icon="Delete" @click.stop type="danger" circle></ElButton>
            </template>
          </ElPopconfirm>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElButton, ElPopconfirm } from 'element-plus'
import { Delete, Plus } from '@element-plus/icons-vue'
import { useDragDrop } from '@/composables/DragDrop'
import { useFile } from '@/composables/File'
import { useNodeBar } from '@/composables/NodeBar'
import { removeDefaultNode } from '@/composables/utils'
import { defaultNodes } from '@/state'
import { screenNodeTypes } from '@/enums'
import type { TImageNodeData } from '@/types'
import NodeBarMediaRender from '@/components/NodeBarMediaRender.vue'

const { t } = useI18n()
const dragdrop = useDragDrop()
const file = useFile()
const nodeBar = useNodeBar()

const nodes = computed(() => defaultNodes.value.filter((item) => item.type == screenNodeTypes.image))

function removeNode(id: string) {
  removeDefaultNode(id)
  file.setDefaultNodes()
}
</script>
