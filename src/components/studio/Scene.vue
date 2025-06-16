<template>
  <div class="relative w-full h-[100px] space-y-2">
    <div class="flex justify-center leading-none font-bold">{{ t('scenes') }}</div>
    <ElDivider class="!m-0 !mb-1"></ElDivider>
    <div class="w-full">
      <ElButton :icon="Plus" @click.left="addScene()" type="success" size="small" class="w-full">
        {{ t('add') }}
      </ElButton>
    </div>
    <div
      v-for="(sce, index) of studioData.scene"
      :key="sce.sceneId"
      :class="activeScene == index ? 'outline-[3px] outline-[var(--primary-color)]' : ''"
      class="relative rounded-md group dark:[box-shadow:0_0_5px_gray] [box-shadow:0_0_5px_black] transition-all duration-200 ease-in-out"
    >
      <SceneThumbnail :live="activeScene == index" :index="index" class="h-24 rounded-md" />
      <div
        v-if="activeScene != index"
        class="absolute top-0 left-0 w-full h-full group-hover:bg-black/35 rounded-md transition-all duration-200 ease-in-out"
      ></div>
      <div v-if="activeScene != index" class="absolute top-0 left-0 w-full h-full flex justify-center items-center">
        <div class="hidden group-hover:block">
          <ElButton @click.left="changeSceneConfim(index)" size="small">{{ t('get_on_scene') }}</ElButton>
        </div>
      </div>
      <div v-if="activeScene != index" class="absolute top-1 right-1 w-full flex justify-end">
        <div class="hidden group-hover:block">
          <ElPopconfirm
            :title="t('sure_for_delete_scene')"
            :confirm-button-text="t('yes')"
            :cancel-button-text="t('no')"
            @confirm="removeSelectedScene(sce.sceneId, index)"
            placement="right-start"
            width="fit"
          >
            <template #reference>
              <ElButton :icon="Delete" type="danger" size="small" circle></ElButton>
            </template>
          </ElPopconfirm>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElButton, ElDivider, ElPopconfirm } from 'element-plus'
import { Delete, Plus } from '@element-plus/icons-vue'
import { useFile } from '@/composables/File'
import { useNodeOrder } from '@/composables/NodeOrder'
import { useScene } from '@/composables/Scene'
import { activeScene, studioData } from '@/state'
import { filePaths } from '@/enums'
import SceneThumbnail from '@/components/studio/scene/SceneThumbnail.vue'

const { t } = useI18n()
const file = useFile()
const scene = useScene()
const nodeOrder = useNodeOrder()

function addScene() {
  const uuid = window.crypto.randomUUID()
  file.fs.writeFileSync(
    `${file.getDirectoryFromMainFolder(filePaths.scene)}/${uuid}.png`,
    file.fs.readFileSync(file.getDirectoryFromMainFolder(filePaths.defaultScenePng))
  )
  studioData.value.scene.push({
    sceneId: uuid,
    nodes: [],
  })
  file.setStudioData()
}

function changeScene(index: number) {
  activeScene.value = index
  localStorage.setItem(import.meta.env.VITE_ACTIVE_SCENE, activeScene.value.toString())
}

function changeSceneConfim(index: number) {
  nodeOrder.resetOrder()
  scene.saveActiveScreen()
  file.setStudioData()
  nextTick(() => changeScene(index))
}

function removeSelectedScene(uuid: string, index: number) {
  file.fs.rmSync(`${file.getDirectoryFromMainFolder(filePaths.scene)}/${uuid}.png`)
  studioData.value.scene.splice(index, 1)
  file.setStudioData()
}
</script>
