<template>
  <div class="recursive-form-block">
    <component
      :is="getComponentName(input.component, input.i18n)"
      v-if="computeConditional(input)"
      :args="{ ...input, key: level[level.length - 1] }"
      :level
      :category
      :type="input.type"
      @update:model-value="$emit('update:valid', valid)"
    />
  </div>
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

<style lang="scss" scoped>
.recursive-form-block {
  .collection-container,
  .object-container {
    margin-bottom: 16px;
  }
  .v-card {
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  }
}
</style>
