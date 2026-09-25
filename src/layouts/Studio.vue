<template>
  <div v-if="loaded" class="relative w-full h-screen z-9 flex flex-col">
    <StudioNavbar></StudioNavbar>
    <router-view></router-view>
  </div>
  <div v-else v-loading="!loadError" class="w-full h-screen flex items-center justify-center">
    <div v-if="loadError" class="text-center space-y-2">
      <div class="font-bold">{{ t('data_load_error') }}</div>
      <div class="text-sm opacity-75">{{ loadError }}</div>
    </div>
  </div>
  <div v-if="loaded">
    <Preview />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { vLoading } from 'element-plus'
import { useFile } from '@/composables/File'
import { useAudio } from '@/composables/Audio'
import { errorMessage } from '@/composables/utils'
import StudioNavbar from '@/layouts/studio/Navbar.vue'
import Preview from '@/components/Preview.vue'
import { activeScene, defaultNodes, studioData } from '@/state'
import { readSetting, writeSetting } from '@/settings'

const { t } = useI18n()
const file = useFile()
const audio = useAudio()

const loaded = ref(false)
const loadError = ref('')

audio.start()

// Tarayıcıda AudioContext ilk kullanıcı etkileşimine kadar askıda kalabilir.
function resumeAudio() {
  audio.resume()
}

function flushChanges() {
  file.flush()
}

// Sahne ve node bar değişiklikleri otomatik kaydedilir.
watch(studioData, () => loaded.value && file.saveStudioLater(), { deep: true })
watch(defaultNodes, () => loaded.value && file.saveDefaultNodesLater(), { deep: true })

onMounted(async () => {
  window.addEventListener('pointerdown', resumeAudio)
  window.addEventListener('beforeunload', flushChanges)

  try {
    await file.loadData()
  } catch (error) {
    console.error(error)
    loadError.value = errorMessage(error)
    return
  }

  const storedScene = Number(readSetting('activeScene'))
  activeScene.value = Number.isInteger(storedScene) && studioData.value.scene[storedScene] ? storedScene : 0
  writeSetting('activeScene', activeScene.value.toString())
  loaded.value = true
})

onBeforeUnmount(async () => {
  window.removeEventListener('pointerdown', resumeAudio)
  window.removeEventListener('beforeunload', flushChanges)
  file.flush()
  await audio.destroy()
})
</script>
