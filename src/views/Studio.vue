<template>
  <div class="w-full flex h-[calc(100vh-var(--studio-navbar-height)-var(--studio-footer-height))]">
    <div class="w-[155px] overflow-y-auto p-2"><Scene /></div>
    <div class="w-[65%] border-x-2 border-[var(--border-color)] dark:border-[--border-dark-color] p-3 overflow-y-auto">
      <Screen />
      <div class="sticky bottom-0 right-0 flex justify-end mt-2">
        <ElButton :disabled="!screenChange.getScreenChangeStatus()" @click.left="saveScene()" type="success">
          {{ t('save') }}
        </ElButton>
      </div>
    </div>
    <div class="w-[25%] p-3 overflow-y-auto">
      <NodeBar />
    </div>
  </div>
  <div
    class="w-full h-[var(--studio-footer-height)] border-t-2 border-[var(--border-color)] dark:border-[--border-dark-color] p-2 overflow-x-auto"
  >
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElButton } from 'element-plus'
import { useScene } from '@/composables/Scene'
import { useFile } from '@/composables/File'
import { useScreenChange } from '@/composables/ScreenChange'
import { useNodeOrder } from '@/composables/NodeOrder'
import Scene from '@/components/studio/Scene.vue'
import Screen from '@/components/studio/Screen.vue'
import NodeBar from '@/components/studio/NodeBar.vue'
import Footer from '@/components/studio/Footer.vue'

const { t } = useI18n()
const file = useFile()
const scene = useScene()
const screenChange = useScreenChange()
const nodeOrder = useNodeOrder()

function saveScene() {
  nodeOrder.resetOrder()
  screenChange.saveChanges()
  scene.saveActiveScreen()
  file.setStudioData()
  nextTick(() => screenChange.setScreenChangeStatus(false))
}
</script>
