<template>
  <div>
    <div class="text-h6 d-flex align-center justify-between">
      <FormAtomsBlockTitle
        v-if="showLabel(level)"
        :i18nKey="args.key"
        :label="$t(args.label, 2)"
      />
      <!-- Show expand/collapse button only if there are facultative fields -->
      <div
        v-if="
          Object.keys(args.items || {}).some(
            (key) => !args.items[key]?.rules?.required
          )
        "
        class="mb-3"
      >
        <v-btn
          :prepend-icon="
            showFacultativeFields ? 'mdi-chevron-up' : 'mdi-chevron-down'
          "
          variant="text"
          size="small"
          @click="showFacultativeFields = !showFacultativeFields"
        >
          {{
            showFacultativeFields
              ? "Hide optional fields"
              : "Show optional fields"
          }}
        </v-btn>
      </div>
    </div>

    <!-- Render form components -->
    <template v-for="key in Object.keys(args.items || {})" :key="key">
      <component
        :is="getComponentName(args.items[key].component)"
        v-if="
          computeInputVisibility(args.items[key]) &&
          (showFacultativeFields || args.items[key]?.rules?.required)
        "
        :args="{ ...args.items[key], key }"
        :level="[...level, key]"
        :category="category"
      />
    </template>
  </div>
</template>
<script setup>
import {
  getComponentName,
  computeInputVisibility,
  showLabel,
} from "../../../composables/useFormDisplay"

const props = defineProps({
  args: {
    type: Object,
    default: () => {
      return {}
    },
  },
  level: {
    type: Array,
    required: false,
    default: () => {
      return []
    },
  },
  category: {
    type: String,
    default: "",
  },
  saving: {
    type: Boolean,
    required: false,
    default: false,
  },
})

// Reactive state for showing/hiding facultative fields
const showFacultativeFields = ref(false)
</script>
<style lang="scss"></style>
