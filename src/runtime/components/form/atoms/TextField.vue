<template>
  <v-text-field
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
    :counter="args.counter"
    :type="args.type || 'text'"
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
console.log("formStore: ", formStore)
console.log("formStore[props.category]: ", formStore[props.category])
console.log("props.category: ", props.category)

const val = computed({
  get() {
    return formStore.getKey({
      key: props.args.key,
      level: props.level,
      store: formStore[props.category],
    })
  },
  set(value) {
    console.log("value: ", value)
    formStore.updateForm({
      key: props.args.key,
      value,
      category: props.category,
      level: props.level,
      store: formStore[props.category],
    })
  },
})

const rules = computed(() => {
  const ruleArray = []

  if (props.args.required) {
    ruleArray.push((value) => {
      if (value === undefined || value === null || value === "") {
        return "This field is required"
      }
      return true
    })
  }

  if (props.args.minLength) {
    ruleArray.push((value) => {
      if (value && value.length < props.args.minLength) {
        return `Minimum length is ${props.args.minLength}`
      }
      return true
    })
  }

  if (props.args.maxLength) {
    ruleArray.push((value) => {
      if (value && value.length > props.args.maxLength) {
        return `Maximum length is ${props.args.maxLength}`
      }
      return true
    })
  }

  if (props.args.pattern) {
    ruleArray.push((value) => {
      if (value && !new RegExp(props.args.pattern).test(value)) {
        return props.args.patternMessage || "Invalid format"
      }
      return true
    })
  }

  return ruleArray
})

onMounted(() => {
  console.log("TextField mounted with args:", props.args)
})
</script>

<style lang="scss" scoped></style>
