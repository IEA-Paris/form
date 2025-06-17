<template>
  <v-file-input
    v-model="val"
    v-bind="$attrs"
    :rules="rules"
    :label="args.label"
    :placeholder="args.placeholder"
    :hint="args.hint"
    :persistent-hint="!!args.hint"
    :required="args.required"
    :disabled="args.disabled"
    :readonly="args.readonly"
    :clearable="args.clearable"
    :accept="args.accept"
    :multiple="args.multiple || false"
    :show-size="args.showSize"
    :counter="args.counter"
    :chips="args.chips && args.multiple"
  />
</template>

<script setup>
import { computed, onMounted } from "vue"
import { useFormStore } from "../../../stores/form"

const props = defineProps({
  args: {
    type: Object,
    required: true,
    default: () => ({}),
  },
  level: {
    type: Array,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
})

const formStore = useFormStore()

const val = computed({
  get() {
    return formStore.getKey({
      key: props.args.key,
      level: props.level,
      store: formStore[props.category],
    })
  },
  set(value) {
    formStore.updateForm({
      key: props.args.key,
      value,
      category: props.category,
      level: props.level,
    })
  },
})

const rules = computed(() => {
  const ruleArray = []

  if (props.args.required) {
    ruleArray.push((value) => {
      if (!value || (Array.isArray(value) && value.length === 0)) {
        return "This field is required"
      }
      return true
    })
  }

  if (props.args.maxSize) {
    ruleArray.push((value) => {
      if (value) {
        const files = Array.isArray(value) ? value : [value]
        for (const file of files) {
          if (file && file.size > props.args.maxSize) {
            return `File size must be less than ${
              props.args.maxSize / 1024 / 1024
            }MB`
          }
        }
      }
      return true
    })
  }

  return ruleArray
})

onMounted(() => {
  console.log("FileInput mounted with args:", props.args)
})
</script>

<style lang="scss" scoped></style>
