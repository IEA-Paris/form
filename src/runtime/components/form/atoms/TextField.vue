<template>
  <v-text-field
    v-model="val"
    v-bind="$attrs"
    :label="args.label"
    :placeholder="args.placeholder"
    :hint="args.hint"
    :persistent-hint="!!args.hint"
    :required="(args.rules && args.rules.required) || false"
    :disabled="args.disabled"
    :readonly="args.readonly"
    :clearable="args.clearable"
    :counter="args.counter"
    :type="args.type"
  />
</template>

<script setup>
import { computed, onMounted } from "vue"
import { useFormStore } from "../../../stores/form"
/* import useFormValidation from "../../../composables/useFormValidation"
console.log("generateInputRules: ", useFormValidation)
 */
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
      store: formStore[props.category],
    })
  },
})

onMounted(() => {})
</script>

<style lang="scss" scoped></style>
