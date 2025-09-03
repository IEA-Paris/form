<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    transition="scale-transition"
    offset-y
    min-width="auto"
  >
    <template #activator="{ props: menuProps }">
      <v-text-field
        v-model="formattedDate"
        v-bind="{ ...menuProps, ...$attrs }"
        :label="args.label"
        :placeholder="args.placeholder"
        :hint="args.hint"
        :persistent-hint="!!args.hint"
        :required="(args.rules && args.rules.required) || false"
        :disabled="args.disabled"
        :readonly="true"
        :clearable="args.clearable"
        :counter="args.counter"
        prepend-inner-icon="mdi-calendar"
        @click:clear="clearDate"
      />
    </template>
    <v-date-picker
      v-model="val"
      :disabled="args.disabled"
      header-color="primary"
      show-adjacent-months
      @update:model-value="onDateSelect"
    />
  </v-menu>
</template>
<script setup>
import { computed, ref } from "vue"
import { useFormStore } from "../../../stores/form"

const props = defineProps({
  args: {
    type: Object,
    required: false,
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
const menu = ref(false)

const val = computed({
  get() {
    return formStore.getKey({
      key: props.args.key,
      level: props.level,
      store: formStore[props.category],
    })
  },
  set(value) {
    console.log("props.level: ", props.level)
    formStore.setKey({
      key: props.args.key,
      value,
      category: props.category,
      level: props.level,
      store: formStore[props.category],
    })
  },
})

// Format the date for display in the text field
const formattedDate = computed(() => {
  if (!val.value) return ""

  // Handle different date formats
  const date = new Date(val.value)
  if (isNaN(date.getTime())) return val.value

  // Format as YYYY-MM-DD or use locale format
  return date.toLocaleDateString()
})

// Handle date selection from picker
const onDateSelect = (selectedDate) => {
  if (selectedDate) {
    val.value = selectedDate
    menu.value = false
  }
}

// Clear the date
const clearDate = () => {
  val.value = null
}
</script>
<style lang="scss"></style>
