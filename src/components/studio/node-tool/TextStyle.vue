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
          <ElColorPicker v-model="styles.color" />
        </div>
      </ElCol>
    </ElRow>
    <ElRow>
      <ElCol :span="24">
        <div class="w-full flex items-center gap-2">
          <div class="flex items-center">{{ t('fontfamily') }}:</div>
          <ElSelect v-model="styles.fontFamily" class="!w-44">
            <ElOption v-for="font of fontFamilies" :key="font.value" :label="font.name" :value="font.value" />
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
import { reactive } from 'vue'
import type { PropType } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElButton, ElCol, ElColorPicker, ElInputNumber, ElOption, ElRow, ElSelect } from 'element-plus'
import { fontFamilies } from '@/enums'
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

const { t } = useI18n()

// Düzenleme, "Kaydet"e basılana kadar bir kopya üzerinde yapılır.
const styles = reactive<TTextNodeDataStyle>({
  color: '#000000',
  fontFamily: fontFamilies[0].value,
  fontSize: 24,
  ...props.textStyle,
})

function save() {
  emit('styleChange', { ...styles })
}
</script>
