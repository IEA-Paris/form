<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    offset-y
    min-width="auto"
  >
    <template #activator="{ props: activatorProps }">
      <v-text-field
        v-model="displayValue"
        v-bind="{ ...$attrs, ...activatorProps }"
        :label="args.label"
        :placeholder="args.placeholder"
        :hint="args.hint"
        :persistent-hint="!!args.hint"
        :required="args.rules.required"
        :disabled="args.disabled"
        :readonly="args.readonly"
        :clearable="args.clearable"
        @click:clear="clearColor"
      >
        <template #prepend-inner>
          <div
            class="color-preview"
            :style="{ backgroundColor: val || '#ffffff' }"
          />
        </template>
      </v-text-field>
    </template>

    <v-card>
      <v-card-text class="pa-4">
        <v-color-picker
          v-model="pickerColor"
          mode="hex"
          hide-inputs
          show-swatches
          :swatches="swatches"
          elevation="0"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="menu = false"> Cancel </v-btn>
        <v-btn color="primary" @click="applyColor"> Apply </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script setup>
import { computed, ref, watch } from "vue"
import { useFormStore } from "../../../stores/form"

const props = defineProps({
  args: {
    type: Object,
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
const pickerColor = ref("#FF0000")

// Default color swatches
const swatches = [
  ["#FF0000", "#AA0000", "#550000"],
  ["#FFFF00", "#AAAA00", "#555500"],
  ["#00FF00", "#00AA00", "#005500"],
  ["#00FFFF", "#00AAAA", "#005555"],
  ["#0000FF", "#0000AA", "#000055"],
  ["#FF00FF", "#AA00AA", "#550055"],
  ["#000000", "#555555", "#FFFFFF"],
]

const val = computed({
  get() {
    return formStore.getKey({
      key: props.args.key,
      level: props.level,
      store: formStore[props.category],
    })
  },
  set(value) {
    console.log("color value: ", value)
    formStore.setKey({
      key: props.args.key,
      value,
      category: props.category,
      level: props.level,
      store: formStore[props.category],
    })
  },
})

const displayValue = computed({
  get() {
    return val.value || ""
  },
  set(value) {
    // Validate hex color format
    if (isValidHexColor(value) || value === "") {
      val.value = value
    }
  },
})

// Watch for changes in val to update picker color
watch(
  () => val.value,
  (newValue) => {
    if (newValue && isValidHexColor(newValue)) {
      pickerColor.value = newValue
    }
  },
  { immediate: true }
)

function isValidHexColor(color) {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)
}

function applyColor() {
  val.value = pickerColor.value
  menu.value = false
}

function clearColor() {
  val.value = ""
  pickerColor.value = "#FF0000"
}
</script>

<style lang="scss" scoped>
.color-preview {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid #ccc;
  margin-right: 8px;
}
</style>
