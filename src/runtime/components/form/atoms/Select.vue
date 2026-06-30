<template>
  <v-col v-if="args.key" cols="12" md="6" class="">
    <div class="text-overline">
      {{ $t(args.key, 2) }}
    </div>
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
      :rules="generateInputRules(args)"
  /></v-col>
</template>

<script setup>
import { computed, onMounted } from "#imports"
import { useFormStore } from "../../../stores/form"
import { useNuxtApp } from "#app"
import generateInputRules from "../../../composables/useFormValidation"
const { $i18n } = useNuxtApp()

defineOptions({
  name: "FormAtomsSelect",
})

const props = defineProps({
  args: {
    type: Object,
    required: true,
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

onMounted(() => {
  console.log("Select mounted with args:", props.args)
})
</script>

<style lang="scss" scoped></style>
