<template>
  <component
    :is="getComponentName(input.component, input.i18n)"
    v-if="computeConditional(input)"
    :args="{ ...input, key: level[level.length - 1] }"
    :level
    :category
    :type="input.type"
    @update:model-value="$emit('update:valid', valid)"
  />
</template>

<script setup>
import {
  getComponentName,
  computeConditional,
} from "../../../composables/useFormDisplay"

const props = defineProps({
  input: { type: Object, required: true },
  category: { type: String, required: true },
  level: { type: Array, required: true },
  saving: { type: Boolean, default: false },
})
</script>

<style lang="scss" scoped></style>
