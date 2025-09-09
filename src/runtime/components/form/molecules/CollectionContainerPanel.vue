<template>
  <v-card
    :key="`col-${level.join('-')}-${level[level.length - 1]}`"
    class="mb-3 pa-3"
  >
    <FormAtomsBlockTitle
      :i18n-key="args.key"
      :label="$t(args.label, 2)"
      :add-btn="true"
      :disabled="!valid"
      @add="addItem" />

    <div v-if="args.description" class="text-h4 mb-2">
      {{ args.description }}
    </div>
    <!-- start by iterating on the actual items in the array (cf pinia store)-->
    <template v-for="(item, index) in val" :key="index">
      <v-divider class="my-2" />
      <div
        v-if="val.length > 1"
        class="text-overline d-flex align-center justify-space-between"
      >
        {{ $t(args.label, 1) + " " + (index + 1) }}
        <v-btn
          icon="mdi-delete"
          variant="outlined"
          class="mt-2"
          @click="deleteItem(index)"
        />
      </div>
      <div :class="valid ? 'text-green' : 'text-red'">
        THIS COLLECTION FORM IS
        {{ valid ? "VALID" : "INVALID" }}
      </div>
      <!-- then use the schema to render the proper component for each item -->
      <template
        v-for="(key, keyIndex) in Object.keys(args.items)"
        :key="keyIndex"
      >
        <component
          :is="
            getComponentName(args.items[key].component, args.items[key].i18n)
          "
          :category
          :args="{ ...args.items[key], index }"
          :level="[...level, index, key]"
          :saving
          @submit.prevent
          @update:model-value="$emit('update:valid', valid)"
          @update:valid="updateChildValidation(index, key, $event)"
        />
      </template> </template
  ></v-card>
</template>
<script setup>
// import { useDisplay } from "vuetify"
// const { smAndUp } = useDisplay()
// const localePath = useLocalePath()
import { useFormStore } from "../../../stores/form"
import {
  getComponentName,
  computeConditional,
} from "../../../composables/useFormDisplay"
import { ref, computed, nextTick } from "vue"
const formStore = useFormStore()
const props = defineProps({
  args: {
    type: Object,
    default: () => {
      return {}
    },
  },
  category: {
    type: String,
    required: true,
  },
  level: {
    type: Array,
    default: () => [],
  },
  saving: {
    type: Boolean,
    default: false,
  },
  category: { type: String, required: true },
})

const addItem = () => {
  formStore.addFormItem({
    category: props.category,
    level: props.level,
  })
}

const val = computed(() => {
  return formStore.getKey({
    level: props.level,
    store: formStore[props.category],
  })
})

const deleteItem = (index) => {
  // Clean up validation flags for the deleted item and reindex
  const newFlags = {}
  Object.keys(fieldValidationFlags.value).forEach((key) => {
    const [itemIndex, fieldKey] = key.split("-", 2)
    const currentIndex = parseInt(itemIndex)
    if (currentIndex > index) {
      // Reindex items after the deleted one
      newFlags[`${currentIndex - 1}-${fieldKey}`] =
        fieldValidationFlags.value[key]
    } else if (currentIndex < index) {
      // Keep items before the deleted one
      newFlags[key] = fieldValidationFlags.value[key]
    }
    // Skip items at the deleted index (effectively deleting them)
  })
  fieldValidationFlags.value = newFlags

  formStore.deleteFormItem({
    category: props.category,
    level: [...props.level, index],
  })
}

// Store individual field validation flags using a flat structure
const fieldValidationFlags = ref({})

// Track individual child form validation
const updateChildValidation = (itemIndex, fieldKey, isValid) => {
  const flagKey = `${itemIndex}-${fieldKey}`
  fieldValidationFlags.value[flagKey] = isValid

  // Emit the global validation state
  nextTick(() => {
    emit("update:valid", valid.value)
  })
}

// Computed property for global validation state
const valid = computed(() => {
  if (!val.value || !Array.isArray(val.value) || val.value.length === 0) {
    return true // Empty collection is considered valid
  }

  // Check if all items have validation state and all fields are valid
  return val.value.every((_, itemIndex) => {
    const fieldKeys = Object.keys(props.args.items || {})
    return fieldKeys.every((fieldKey) => {
      const flagKey = `${itemIndex}-${fieldKey}`
      return fieldValidationFlags.value[flagKey] === true
    })
  })
})

// Define emits
const emit = defineEmits(["update:valid"])
</script>
<style lang="scss"></style>
