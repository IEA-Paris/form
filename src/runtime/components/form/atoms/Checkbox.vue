<template>
  <v-checkbox
    v-model="val"
    v-bind="$attrs"
    :rules="rules"
    :label="args.label"
    :hint="args.hint"
    :persistent-hint="!!args.hint"
    :required="args.required"
    :disabled="args.disabled"
    :readonly="args.readonly"
    :true-value="args.trueValue"
    :false-value="args.falseValue"
    :color="args.color"
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
      if (value !== true && value !== props.args.trueValue) {
        return "This field is required"
      }
      return true
    })
  }

  return ruleArray
})

onMounted(() => {
  console.log("Checkbox mounted with args:", props.args)
})
</script>

<style lang="scss" scoped></style>
