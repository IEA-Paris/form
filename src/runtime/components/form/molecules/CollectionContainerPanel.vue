<template>
  <v-card
    :key="`col-${level.join('-')}-${level[level.length - 1]}`"
    class="mb-3 pa-3"
    variant="outlined"
  >
    <div class="text-h6 d-flex align-center justify-space-between">
      <template v-if="args.label">
        {{ $t(args.label, 2) }}
      </template>
      <v-btn
        prepend-icon="mdi-plus"
        color="primary"
        variant="outlined"
        class="mt-2"
        @click="addItem"
        :disabled="!isCollectionValid"
      >
        {{ (args && args.addText) || "Add Item" }}
      </v-btn>
    </div>
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
      <div :class="isCollectionValid ? 'text-green' : 'text-red'">
        THIS COLLECTION FORM IS
        {{ isCollectionValid ? "VALID" : "INVALID" }}
      </div>
      <!-- then use the schema to render the proper component for each item -->
      <template
        v-for="(key, keyIndex) in Object.keys(args.items)"
        :key="keyIndex"
      >
        <component
          @update:valid="updateChildValidation(index, key, $event)"
          :is="getComponentName(args.items[key].component)"
          :category
          :args="{ ...args.items[key], index }"
          :level="[...level, index, key]"
          :saving
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
  computeInputVisibility,
} from "../../../composables/useFormDisplay"
import { ref, computed, watch, nextTick } from "vue"
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

console.log("CollectionContainerPanel props", props.args)
const addItem = () => {
  formStore.addFormItem({
    category: props.category,
    level: props.level,
  })
}
const deleteItem = (index) => {
  // Clean up validation state for the deleted item
  delete validationState.value[index]

  // Reindex remaining items
  const newValidationState = {}
  Object.keys(validationState.value).forEach((key) => {
    const itemIndex = parseInt(key)
    if (itemIndex > index) {
      newValidationState[itemIndex - 1] = validationState.value[key]
    } else if (itemIndex < index) {
      newValidationState[itemIndex] = validationState.value[key]
    }
  })
  validationState.value = newValidationState

  formStore.deleteFormItem({
    category: props.category,
    level: [...props.level, index],
  })
}
const val = computed(() => {
  return formStore.getKey({
    level: props.level,
    store: formStore[props.category],
  })
})

// Enhanced validation tracking
const validationState = ref({})

// Initialize validation state when items change
watch(
  val,
  (newVal) => {
    if (newVal && Array.isArray(newVal)) {
      // Initialize validation state for new items
      newVal.forEach((_, index) => {
        if (!(index in validationState.value)) {
          validationState.value[index] = {}
        }
      })

      // Clean up validation state for removed items
      Object.keys(validationState.value).forEach((key) => {
        const index = parseInt(key)
        if (index >= newVal.length) {
          delete validationState.value[key]
        }
      })
    }
  },
  { immediate: true, deep: true }
)

// Track individual child form validation
const updateChildValidation = (itemIndex, fieldKey, isValid) => {
  if (!validationState.value[itemIndex]) {
    validationState.value[itemIndex] = {}
  }

  validationState.value[itemIndex][fieldKey] = isValid

  // Emit the global validation state
  nextTick(() => {
    emit("update:valid", isCollectionValid.value)
  })
}

// Computed property for global validation state
const isCollectionValid = computed(() => {
  if (!val.value || !Array.isArray(val.value) || val.value.length === 0) {
    return true // Empty collection is considered valid
  }

  // Check if all items have validation state and all fields are valid
  return val.value.every((_, itemIndex) => {
    const itemValidation = validationState.value[itemIndex]
    if (!itemValidation) return false

    // Check if all fields in this item are valid
    const fieldKeys = Object.keys(props.args.items || {})
    return fieldKeys.every((fieldKey) => itemValidation[fieldKey] === true)
  })
})

// Define emits
const emit = defineEmits(["update:valid"])
</script>
<style lang="scss"></style>
