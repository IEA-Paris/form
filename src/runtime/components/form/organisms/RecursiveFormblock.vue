<template>
  <div class="recursive-form-block">
    <!-- Regular Field Form Block / primitive -->
    <template v-if="!input.items">
      <component
        :is="getComponentName(input.type)"
        v-if="computeInputVisibility(input)"
        :args="{ ...input, key: lastLevelItem }"
        :level="level"
        :category="category"
        :disabled="saving"
      />
    </template>

    <!-- Collection Form Block (Array) -->
    <template v-else-if="isArray(input.items)">
      <div class="collection-container">
        <h4 v-if="input.label">{{ input.label }}</h4>
        <p v-if="input.description" class="text-caption mb-2">
          {{ input.description }}
        </p>

        <div v-if="items && items.length > 0">
          <v-card
            v-for="(item, index) in items"
            :key="`collection-${level.join('-')}-${index}`"
            class="mb-3 pa-3"
            variant="outlined"
          >
            <div class="d-flex justify-between align-center mb-2">
              <h5>{{ input.itemTitle || `Item ${index + 1}` }}</h5>
              <v-btn
                icon="mdi-delete"
                size="small"
                color="error"
                variant="text"
                @click="deleteItem(index)"
              />
            </div>

            <FormRecursiveFormblock
              v-for="(field, fieldIndex) in input.items"
              :key="`field-${index}-${fieldIndex}`"
              :input="field"
              :category="category"
              :level="[...level, index, field.key]"
              :saving="saving"
            />
          </v-card>
        </div>

        <v-btn
          prepend-icon="mdi-plus"
          color="primary"
          variant="outlined"
          class="mt-2"
          @click="addItem"
        >
          {{ input.addText || "Add Item" }}
        </v-btn>
      </div>
    </template>

    <!-- Object Form Block -->
    <template v-else>
      <div class="object-container">
        <h4 v-if="input.label">{{ input.label }}</h4>
        <p v-if="input.description" class="text-caption mb-2">
          {{ input.description }}
        </p>

        <v-card class="pa-3" variant="outlined">
          <FormRecursiveFormblock
            v-for="(field, key) in input.items"
            :key="`object-${key}`"
            :input="field"
            :category="category"
            :level="[...level, key]"
            :saving="saving"
          />
        </v-card>
      </div>
    </template>

    <slot />
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue"
import { useFormStore } from "#imports"

const props = defineProps({
  input: {
    type: Object,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  level: {
    type: Array,
    required: true,
  },
  saving: {
    type: Boolean,
    default: false,
  },
  rootIndex: {
    type: Number,
    default: 0,
  },
})

const formStore = useFormStore()

const lastLevelItem = computed(() => {
  return props.level[props.level.length - 1]
})

const items = computed(() => {
  return formStore.getKey({
    key: lastLevelItem.value,
    level: props.level,
    store: formStore[props.category]?.form?.values,
  })
})

const isArray = (items) => {
  return Array.isArray(items)
}

const computeInputVisibility = (input) => {
  // Simple visibility logic - can be enhanced
  if (input.condition) {
    // Implement conditional visibility logic here
    return true
  }
  return true
}

const getComponentName = (type) => {
  const componentMap = {
    TextField: "FormTextField",
    TextArea: "FormTextArea",
    Select: "FormSelect",
    Checkbox: "FormCheckbox",
    BooleanSwitch: "FormBooleanSwitch",
    FileInput: "FormFileInput",
    AutoComplete: "FormAutoComplete",
  }

  return componentMap[type] || "FormTextField"
}

const addItem = () => {
  formStore.addFormItem({
    key: lastLevelItem.value,
    category: props.category,
    level: props.level,
  })
}

const deleteItem = (index) => {
  formStore.deleteFormItem({
    key: lastLevelItem.value,
    category: props.category,
    level: [...props.level, index],
  })
}

onMounted(() => {
  console.log("RecursiveFormblock mounted:", {
    input: props.input,
    level: props.level,
    category: props.category,
  })
})
</script>

<style lang="scss" scoped>
.recursive-form-block {
  .collection-container,
  .object-container {
    margin-bottom: 16px;
  }

  .v-card {
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  }
}
</style>
