<template>
  <div class="w-full p-2 space-y-3">
    <ElRow :gutter="20">
      <ElCol :span="16">
        <div class="w-full flex items-center gap-2">
          <div class="flex items-center">{{ t('fontsize') }}:</div>
          <ElInputNumber v-model="styles.fontSize" :min="6" :max="100" class="!w-[130px]" controls-position="right" />
        </div>
      </ElCol>
      <ElCol :span="8">
        <div class="w-full flex items-center gap-2">
          <div class="flex items-center">{{ t('color') }}:</div>
          <ElConfigProvider :locale="configProviderLocale">
            <ElColorPicker v-model="styles.color" />
          </ElConfigProvider>
        </div>
      </ElCol>
    </ElRow>
    <ElRow>
      <ElCol :span="24">
        <div class="w-full flex items-center gap-2">
          <div class="flex items-center">{{ t('fontfamily') }}:</div>
          <ElSelect v-model="styles.fontFamily" class="!w-44">
            <ElOption v-for="font of fontFamilies" :label="font.name" :value="font.value" />
          </ElSelect>
        </div>
      </ElCol>
    </ElRow>
    <div class="mt-4">
      <ElButton @click.left="save()" type="success">{{ t('save') }}</ElButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import type { PropType } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  ElButton,
  ElCol,
  ElColorPicker,
  ElConfigProvider,
  ElInputNumber,
  ElOption,
  ElRow,
  ElSelect,
} from 'element-plus'
import tr from 'element-plus/dist/locale/tr.mjs'
import en from 'element-plus/dist/locale/en.mjs'
import { fontFamilies, localeNames } from '@/enums'
import type { TTextNodeDataStyle } from '@/types'

const emit = defineEmits<{
  (e: 'styleChange', data: TTextNodeDataStyle): void
}>()

const props = defineProps({
  textStyle: {
    type: Object as PropType<TTextNodeDataStyle>,
    required: false,
  },
})

const { t, locale } = useI18n()

const styles = reactive(
  props.textStyle ?? {
    color: '#000000',
    fontFamily: 'Arial',
    fontSize: 24,
  }
)

const configProviderLocale = computed(() => (locale.value == localeNames.tr ? tr : en))

function save() {
  emit('styleChange', styles)
}
</script>
