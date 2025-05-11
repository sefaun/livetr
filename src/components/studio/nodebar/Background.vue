<template>
  <div class="space-y-4">
    <div class="w-full">
      <ElButton :icon="Plus" @click.left="file.setImageStore(screenNodeTypes.background)" type="success" class="w-full">
        {{ t('add') }}
      </ElButton>
    </div>
    <div class="w-full space-y-1">
      <div
        v-for="node of nodes"
        :id="node.id"
        @click.left="createBackground($event, node)"
        class="w-full flex p-2 border border-gray-300 rounded-md cursor-pointer gap-2"
      >
        <div class="w-full flex gap-2">
          <div class="min-w-12 min-h-12">
            <NodeBarMediaRender
              :src="node.default ? file.getDirectoryFromMainFolder((node.data as TBackgroundNodeData).src) : (node.data as TBackgroundNodeData).src"
              class="w-12 h-12 rounded-md"
            />
          </div>
          <div class="w-full flex items-center">
            {{ (node.data as TBackgroundNodeData).title }}
          </div>
        </div>
        <div class="w-8 flex items-center">
          <ElButton :icon="Delete" @click.stop.left="removeNode(node.id)" type="danger" circle></ElButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElButton } from 'element-plus'
import { Delete, Plus } from '@element-plus/icons-vue'
import { useDragDrop } from '@/composables/DragDrop'
import { useFile } from '@/composables/File'
import { removeDefaultNode } from '@/composables/utils'
import { defaultNodes, studioData } from '@/state'
import { screenNodeTypes } from '@/enums'
import type { TBackgroundNodeData, TNode } from '@/types'
import NodeBarMediaRender from '@/components/NodeBarMediaRender.vue'

const { t } = useI18n()
const dragdrop = useDragDrop()
const file = useFile()

const nodes = computed(() => defaultNodes.value.filter((item) => item.type == screenNodeTypes.background))

function deleteExistBackground() {
  const backgroundItemIndex = studioData.value.nodes.findIndex((item) => item.type == screenNodeTypes.background)

  if (backgroundItemIndex != -1) {
    studioData.value.nodes.splice(backgroundItemIndex, 1)
  }
}

function createBackground(event: MouseEvent, node: TNode) {
  deleteExistBackground()
  dragdrop.nondragdrop(event, node)
}

function removeNode(id: string) {
  removeDefaultNode(id)
  file.exportDefaultNodes()
}
</script>
