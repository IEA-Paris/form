<template>
  <div class="recursive-form-block">
    <!-- PRIMITIVE -->
    <template v-if="input.type === 'PRIMITIVE'">
      <component
        :is="getComponentName(input.component)"
        v-if="computeInputVisibility(input)"
        :args="{ ...input, key: lastLevelItem }"
        :level
        :category
        :disabled="saving"
      />
    </template>

    <!-- ARRAY -->
    <template v-else-if="input.type === 'ARRAY'">
      <div class="collection-container">
        <component
          :is="getComponentName(input.component)"
          v-if="computeInputVisibility(input)"
          :args="{ ...input, key: lastLevelItem }"
          :level
          :category
          :disabled="saving"
        />
      </div>
    </template>

    <!-- OBJECT -->
    <template v-else-if="input.type === 'OBJECT'">
      <component
        :is="getComponentName(input.component)"
        v-if="computeInputVisibility(input)"
        :args="{ ...input, key: lastLevelItem }"
        :level="[...level, lastLevelItem]"
        :category
        :disabled="saving"
      />
    </template>

    <!-- DOCUMENT -->
    <template v-else-if="input.type === 'DOCUMENT'">
      PICKER
      <component
        :is="getComponentName(input.component)"
        v-if="computeInputVisibility(input)"
        :args="{ ...input, key: lastLevelItem }"
        :level
        :category
        :type="input.type"
        :disabled="saving"
      />
    </template>
  </div>
</template>

<script setup>
import { computed } from "vue"
import {
  getComponentName,
  computeInputVisibility,
} from "../../../composables/useFormDisplay"

const props = defineProps({
  input: { type: Object, required: true },
  category: { type: String, required: true },
  level: { type: Array, required: true },
  saving: { type: Boolean, default: false },
  rootIndex: { type: Number, default: 0 },
})

const lastLevelItem = computed(() => props.level[props.level.length - 1])
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
