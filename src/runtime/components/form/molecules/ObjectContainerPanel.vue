<template>
  <div v-if="args.label && isArray" class="text-h6 d-flex align-center">
    {{ $t(args.label, 2) }}
  </div>
  <template v-for="key in Object.keys(args.items)" :key="key">
    <component
      :is="getComponentName(args.items[key].component)"
      v-if="computeInputVisibility(args.items[key])"
      :args="{ ...args.items[key], key }"
      :level="[...level, key]"
      :category="category"
      :rules="generateInputRules(args.items[key])"
    />
  </template>
</template>
<script setup>
import {
  getComponentName,
  computeInputVisibility,
} from "../../../composables/useFormDisplay"
import generateInputRules from "../../../composables/useFormValidation"
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
const isArray =
  props.level.length > 1 &&
  Number.isInteger(props.level[props.level.length - 1])
</script>
<style lang="scss"></style>
