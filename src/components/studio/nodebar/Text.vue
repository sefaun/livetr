<template>
  <div class="space-y-4">
    <div class="w-full space-y-2">
      <div class="w-full flex justify-center gap-2">
        <ElInput v-model="text" type="textarea" />
        <ElButton @click.left="setStyleDialogStatus(true)" type="primary">
          {{ t('style_settings') }}
        </ElButton>
      </div>
      <div class="w-full flex justify-center">
        <ElButton :icon="Plus" @click.left="addNewText()" type="success" class="w-full">
          {{ t('add') }}
        </ElButton>
      </div>
    </div>
    <div class="w-full space-y-1">
      <div
        v-for="node of nodes"
        :key="node.id"
        :id="node.id"
        @dragstart="dragdrop.dragstart($event, node)"
        draggable="true"
        class="w-full flex p-2 border border-gray-300 rounded-md cursor-move gap-2"
      >
        <div class="w-full flex items-center">
          {{ (node.data as TTextNodeData).text }}
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
  <ElDialog v-model="styleDialogStatus" :title="t('style_settings')" :close-on-click-modal="false" width="400px">
    <TextStyle v-if="styleDialogStatus" @styleChange="styleChange" />
  </ElDialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { cloneDeep } from 'lodash'
import { ElButton, ElDialog, ElInput, ElNotification, ElPopconfirm } from 'element-plus'
import { Delete, Plus } from '@element-plus/icons-vue'
import { useDragDrop } from '@/composables/DragDrop'
import { useNodeBar } from '@/composables/NodeBar'
import { useFile } from '@/composables/File'
import { removeDefaultNode } from '@/composables/utils'
import { defaultNodes } from '@/state'
import { screenNodeTypes } from '@/enums'
import type { TTextNodeData, TTextNodeDataStyle } from '@/types'
import TextStyle from '@/components/studio/node-tool/TextStyle.vue'

const { t } = useI18n()
const dragdrop = useDragDrop()
const nodeBar = useNodeBar()
const file = useFile()

const styleDialogStatus = ref(false)
const text = ref('')
const styles = ref({
  color: '#FFFFFF',
  fontFamily: 'Arial',
  fontSize: 24,
})

const nodes = computed(() => defaultNodes.value.filter((item) => item.type == screenNodeTypes.text))

function addNewText() {
  if (text.value.trim() == '') {
    ElNotification({
      message: t('content_empty'),
      type: 'warning',
    })
    return
  }

  nodeBar.setTextStore(cloneDeep({ text: text.value, style: styles.value }))

  text.value = ''
  setStyleDialogStatus(false)
}

function removeNode(id: string) {
  removeDefaultNode(id)
  file.setDefaultNodes()
}

function styleChange(data: TTextNodeDataStyle) {
  styles.value = data
  setStyleDialogStatus(false)
}

function setStyleDialogStatus(value: boolean) {
  styleDialogStatus.value = value
}
</script>
