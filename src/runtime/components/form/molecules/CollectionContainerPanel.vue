<template>
  <v-card
    :key="`col-${level.join('-')}-${level[level.length - 1]}`"
    class="mb-3 pa-3"
    :class="{
      required: args.rules && args.rules.required,
      valid: valid,
      invalid: !valid,
    }"
  >
    <!--     <div :class="valid ? 'text-green' : 'text-red'">
      THIS ARRAY FORM IS {{ valid ? "VALID" : "INVALID" }}
    </div> -->
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
      <div v-if="!valid" class="text-red mb-2">
        {{ validationRules.length > 0 ? "Collection validation failed" : "" }}
      </div>
      <!-- then use the schema to render the proper component for each item -->
      <template
        v-for="(key, keyIndex) in Object.keys(args.items)"
        :key="keyIndex"
      >
        <FormOrganismsRecursiveFormblock
          :category
          :input="args.items[key]"
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
import { useFormStore } from "../../../stores/form"
import useFormValidation from "../../../composables/useFormValidation"
import { ref, computed, watch } from "vue"

// Define emits first
const emit = defineEmits(["update:valid"])

const formStore = useFormStore()
const props = defineProps({
  args: {
    type: Object,
    default: () => ({}),
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

// Store child validation flags
const childValidationFlags = ref({})

const deleteItem = (index) => {
  // Clean up validation flags for the deleted item and reindex
  const newFlags = {}
  Object.keys(childValidationFlags.value).forEach((key) => {
    const [itemIndex, fieldKey] = key.split("-", 2)
    const currentIndex = parseInt(itemIndex)
    if (currentIndex > index) {
      newFlags[`${currentIndex - 1}-${fieldKey}`] =
        childValidationFlags.value[key]
    } else if (currentIndex < index) {
      newFlags[key] = childValidationFlags.value[key]
    }
  })
  childValidationFlags.value = newFlags

  formStore.deleteFormItem({
    category: props.category,
    level: [...props.level, index],
  })
}

const updateChildValidation = (itemIndex, fieldKey, isValid) => {
  const flagKey = `${itemIndex}-${fieldKey}`
  childValidationFlags.value[flagKey] = isValid
}

// Count of valid child items
const validChildCount = computed(() => {
  if (!val.value || !Array.isArray(val.value) || val.value.length === 0) {
    return 0
  }

  return val.value.filter((_, itemIndex) => {
    const fieldKeys = Object.keys(props.args.items || {})
    return fieldKeys.every((fieldKey) => {
      const flagKey = `${itemIndex}-${fieldKey}`
      return childValidationFlags.value[flagKey] === true
    })
  }).length
})

// Apply validation rules using the composable
const validationRules = useFormValidation(props.args)

const valid = computed(() => {
  const count = validChildCount.value

  // If no rules, it's valid
  if (!validationRules || validationRules.length === 0) {
    return true
  }

  // Apply all validation rules to the count
  for (const rule of validationRules) {
    const result = rule(count)
    if (result !== true) {
      return false
    }
  }

  return true
})

// Watch valid state and emit changes
watch(
  valid,
  (newValid) => {
    emit("update:valid", newValid)
  },
  { immediate: true }
)
</script>
<style lang="scss"></style>
