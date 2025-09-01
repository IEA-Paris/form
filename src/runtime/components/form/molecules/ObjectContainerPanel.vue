<template>
  <template v-for="key in Object.keys(args.items)" :key="key">
    <component
      :is="getComponentName(args.items[key].component)"
      v-if="computeInputVisibility(args.items[key])"
      :args="{ ...args.items[key], key }"
      :level="[...level, key]"
      :category="category"
    />
  </template>
</template>
<script setup>
import {
  getComponentName,
  computeInputVisibility,
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
</script>
<style lang="scss"></style>
