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
        <h4 v-if="input.label">{{ $t(input.label) }}</h4>
        <p v-if="input.description" class="text-caption mb-2">
          {{ input.description }}
        </p>
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
      <div class="object-container">
        <h4 v-if="input.label">{{ $t(input.label) }}</h4>
        <p v-if="input.description" class="text-caption mb-2">
          {{ input.description }}
        </p>
      </div>
      <component
        :is="getComponentName(input.component)"
        v-if="computeInputVisibility(input)"
        :args="{ ...input, key: lastLevelItem }"
        :level
        :category
        :disabled="saving"
      />
    </template>

    <!-- DOCUMENT -->
    <template v-else-if="input.type === 'DOCUMENT'">
      <div class="document-container">
        <h4 v-if="input.label">{{ $t(input.label) }}</h4>
        <p v-if="input.description" class="text-caption mb-2">
          {{ input.description }}
        </p>
        PICKER
        <v-card class="pa-3" variant="outlined">
          <component
            :is="getComponentName(input.component)"
            v-if="computeInputVisibility(input)"
            :args="{ ...input, key: lastLevelItem }"
            :level
            :category
            :type="input.type"
            :disabled="saving"
          />
        </v-card>
      </div>
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
