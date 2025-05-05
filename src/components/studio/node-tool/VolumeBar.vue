<template>
  <div class="w-[15px] h-[100px] bg-gray-200 rounded overflow-hidden relative border border-gray-300">
    <div
      class="bg-green-500 w-full absolute bottom-0 transition-all duration-100 ease-in-out"
      :style="{ height: fillHeight + '%' }"
    ></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: {
    type: Number,
    required: true,
  },
  min: {
    type: Number,
    default: 0,
  },
  max: {
    type: Number,
    default: 100,
  },
})

const fillHeight = computed(
  () => ((Math.min(Math.max(props.value, props.min), props.max) - props.min) / (props.max - props.min)) * 100
)
</script>
