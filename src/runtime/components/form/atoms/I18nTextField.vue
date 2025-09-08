<template>
  <v-row>
    <v-col cols="6">
      <v-text-field
        v-model="val"
        v-bind="$attrs"
        :placeholder="args.placeholder"
        :hint="args.hint"
        :persistent-hint="!!args.hint"
        :required="(args.rules && args.rules.required) || false"
        :disabled="args.disabled"
        :readonly="args.readonly"
        :clearable="args.clearable"
        :counter="args.counter"
        :type="args.type"
        :rules="generateInputRules(args)"
      >
        <template #label>
          <span>{{ $t(args.label) }}</span>
          <sup
            ><v-icon
              v-if="args.rules && args.rules.required"
              color="red"
              size="small"
              class="ml-1"
            >
              mdi-asterisk
            </v-icon></sup
          >
        </template>
      </v-text-field></v-col
    >
    <v-col cols="6">
      <v-text-field
        v-model="val"
        v-bind="$attrs"
        :placeholder="args.placeholder"
        :hint="args.hint"
        :persistent-hint="!!args.hint"
        :required="(args.rules && args.rules.required) || false"
        :disabled="args.disabled"
        :readonly="args.readonly"
        :clearable="args.clearable"
        :counter="args.counter"
        :type="args.type"
        :rules="generateInputRules(args)"
      >
        <template #label>
          <span>{{ $t(args.label) }}</span>
          <sup
            ><v-icon
              v-if="args.rules && args.rules.required"
              color="red"
              size="small"
              class="ml-1"
            >
              mdi-asterisk
            </v-icon></sup
          >
        </template>
      </v-text-field></v-col
    >
  </v-row>
</template>

<script setup>
import { computed, onMounted } from "vue"
import { useFormStore } from "../../../stores/form"
import generateInputRules from "../../../composables/useFormValidation"

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
      level: props.level,
      store: formStore[props.category],
    })
  },
  set(value) {
    formStore.setKey({
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
