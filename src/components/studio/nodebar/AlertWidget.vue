<template>
  <div class="space-y-4">
    <!-- Add New Alert Widget Form -->
    <div class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
      <h3 class="text-lg font-semibold mb-3">{{ t('add_alert_widget') }}</h3>
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium mb-1">{{ t('alert_title') }}</label>
          <ElInput
            v-model="alertTitle"
            :placeholder="t('enter_alert_title')"
            size="small"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">{{ t('alert_url') }}</label>
          <ElInput
            v-model="alertUrl"
            :placeholder="t('enter_twitch_alert_url')"
            size="small"
          />
        </div>
        <div class="flex gap-2">
          <ElButton 
            @click="addAlertWidget" 
            type="primary" 
            size="small"
            :disabled="!alertTitle.trim() || !alertUrl.trim()"
          >
            {{ t('add_alert') }}
          </ElButton>
          <ElButton @click="clearForm" size="small">
            {{ t('clear') }}
          </ElButton>
        </div>
      </div>
    </div>

    <!-- Existing Alert Widgets -->
    <div v-if="nodes.length > 0">
      <h3 class="text-lg font-semibold mb-3">{{ t('existing_alerts') }}</h3>
      <div class="grid grid-cols-1 gap-3">
        <div
          v-for="node in nodes"
          :key="node.id"
          class="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
          draggable="true"
          @dragstart="dragdrop.dragstart($event, node)"
          @click.left="dragdrop.nondragdrop($event, node)"
        >
          <div class="flex-1">
            <h4 class="font-medium">{{ (node.data as TAlertWidgetNodeData).title }}</h4>
            <p class="text-sm text-gray-600 dark:text-gray-400 truncate">
              {{ (node.data as TAlertWidgetNodeData).url }}
            </p>
            <div class="flex items-center gap-2 mt-2">
              <ElTag
                :type="(node.data as TAlertWidgetNodeData).isActive ? 'success' : 'info'"
                size="small"
              >
                {{ (node.data as TAlertWidgetNodeData).isActive ? t('active') : t('inactive') }}
              </ElTag>
            </div>
          </div>
          <div class="flex gap-2">
            <ElButton
              @click.stop="toggleAlert(node.id)"
              :type="(node.data as TAlertWidgetNodeData).isActive ? 'warning' : 'success'"
              size="small"
            >
              {{ (node.data as TAlertWidgetNodeData).isActive ? t('deactivate') : t('activate') }}
            </ElButton>
            <ElButton @click.stop="removeNode(node.id)" type="danger" size="small">
              {{ t('remove') }}
            </ElButton>
          </div>
        </div>
      </div>
    </div>

    <!-- No Alerts Message -->
    <div v-else class="text-center text-gray-500 dark:text-gray-400 py-8">
      <p>{{ t('no_alerts_yet') }}</p>
      <p class="text-sm">{{ t('add_twitch_alert_url_above') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElInput, ElButton, ElTag, ElNotification } from 'element-plus'
import { useDragDrop } from '@/composables/DragDrop'
import { useNodeBar } from '@/composables/NodeBar'
import { useFile } from '@/composables/File'
import { removeDefaultNode } from '@/composables/utils'
import { defaultNodes } from '@/state'
import { screenNodeTypes } from '@/enums'
import type { TAlertWidgetNodeData } from '@/types'

const { t } = useI18n()
const dragdrop = useDragDrop()
const nodeBar = useNodeBar()
const file = useFile()

const alertTitle = ref('')
const alertUrl = ref('')

const nodes = computed(() => defaultNodes.value.filter((item) => item.type == screenNodeTypes.alertWidget))

function addAlertWidget() {
  if (!alertTitle.value.trim() || !alertUrl.value.trim()) {
    ElNotification({
      message: t('please_fill_all_fields'),
      type: 'warning',
    })
    return
  }

  // Validate URL
  try {
    new URL(alertUrl.value)
  } catch {
    ElNotification({
      message: t('invalid_url'),
      type: 'error',
    })
    return
  }

  nodeBar.setAlertWidgetStore(alertTitle.value.trim(), alertUrl.value.trim())

  ElNotification({
    message: t('alert_widget_added'),
    type: 'success',
  })

  clearForm()
}

function clearForm() {
  alertTitle.value = ''
  alertUrl.value = ''
}

function removeNode(id: string) {
  removeDefaultNode(id)
  file.setDefaultNodes()
  
  ElNotification({
    message: t('alert_widget_removed'),
    type: 'success',
  })
}

function toggleAlert(id: string) {
  const node = defaultNodes.value.find((item) => item.id === id)
  if (node && node.type === screenNodeTypes.alertWidget) {
    const alertData = node.data as TAlertWidgetNodeData
    alertData.isActive = !alertData.isActive
    file.setDefaultNodes()
    
    ElNotification({
      message: alertData.isActive ? t('alert_activated') : t('alert_deactivated'),
      type: 'info',
    })
  }
}
</script> 