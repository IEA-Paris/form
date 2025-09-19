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
  //!\ TODO: uncomment required once validation is 100%  working
  .v-card.valid/* .required */,
  .v-form.valid/* .required */ {
    padding-left: 5px;
    border-left: solid green 3px !important;
  }
  .v-card.invalid/* .required */,
  .v-form.invalid/* .required */ {
    padding-left: 5px;
    border-left: solid red 3px !important;
  }
}
</style>
