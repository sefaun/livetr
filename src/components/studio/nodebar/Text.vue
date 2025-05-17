<template>
  <div class="space-y-4">
    <div class="w-full flex justify-center gap-2">
      <ElInput v-model="text" type="textarea" />
      <ElConfigProvider :locale="configProviderLocale">
        <ElColorPicker v-model="color" />
      </ElConfigProvider>
      <ElButton type="primary" @click="addNewText()">
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
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElButton, ElColorPicker, ElConfigProvider, ElInput, ElNotification, ElPopconfirm } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'
import { useDragDrop } from '@/composables/DragDrop'
import { useNodeBar } from '@/composables/NodeBar'
import { useFile } from '@/composables/File'
import { removeDefaultNode } from '@/composables/utils'
import { defaultNodes } from '@/state'
import { localeNames, screenNodeTypes } from '@/enums'
import type { TTextNodeData } from '@/types'
import tr from 'element-plus/dist/locale/tr.mjs'
import en from 'element-plus/dist/locale/en.mjs'

const { t, locale } = useI18n()
const dragdrop = useDragDrop()
const nodeBar = useNodeBar()
const file = useFile()

const text = ref('')
const color = ref('#409EFF')

const configProviderLocale = computed(() => (locale.value == localeNames.tr ? tr : en))
const nodes = computed(() => defaultNodes.value.filter((item) => item.type == screenNodeTypes.text))

function addNewText() {
  if (text.value.trim() === '') {
    ElNotification({
      message: t('content_empty'),
      type: 'warning',
    })
    return
  }
  nodeBar.setTextStore({
    text: text.value,
    color: color.value,
    fontFamily: 'Arial',
    fontSize: 50,
  })
  text.value = ''
}

function removeNode(id: string) {
  removeDefaultNode(id)
  file.setDefaultNodes()
}
</script>
