<template>
  <v-select
    v-model="val"
    v-bind="$attrs"
    :items="computedItems"
    :label="args.label"
    :placeholder="args.placeholder"
    :hint="args.hint"
    :persistent-hint="!!args.hint"
    :required="args.required"
    :disabled="args.disabled"
    :readonly="args.readonly"
    :clearable="args.clearable"
    :multiple="args.multiple"
    :chips="args.chips && args.multiple"
    :item-title="args.itemTitle || 'title'"
    :item-value="args.itemValue || 'value'"
    :return-object="args.returnObject"
  />
</template>

<script setup>
import { computed, onMounted } from "vue"
import { useFormStore } from "../../../stores/form"
const { $i18n } = useNuxtApp()

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
  items: {
    type: Array,
    default: () => [],
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
    formStore.setKey({
      key: props.args.key,
      value,
      category: props.category,
      level: props.level,
    })
  },
})

const computedItems = computed(() => {
  if (props.args.items) {
    return Object.keys(props.args.items).map((key) => {
      return {
        ...props.args.items[key],
        value: props.args.items[key] ?? key,
        title: $i18n.t(props.args.items[key]) ?? key,
      }
    })
  }
  return props.args.items || []
})

const rules = computed(() => {
  const ruleArray = []

  if (props.args.required) {
    ruleArray.push((value) => {
      if (
        value === undefined ||
        value === null ||
        (Array.isArray(value) && value.length === 0) ||
        value === ""
      ) {
        return "This field is required"
      }
      return true
    })
  }

  return ruleArray
})

onMounted(() => {
  console.log("Select mounted with args:", props.args)
})
</script>

<style lang="scss" scoped></style>
