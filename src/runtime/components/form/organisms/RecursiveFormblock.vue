<template>
  <div class="recursive-form-block">
    <!-- Regular Field Form Block / primitive -->
    <template v-if="input.type === 'PRIMITIVE'">
      <component
        :is="getComponentName(input.component)"
        v-if="computeInputVisibility(input)"
        :args="{ ...input, key: lastLevelItem }"
        :level
        :category
        :disabled="saving"
      />
    </template>

    <!-- Collection Form Block (Array) -->
    <template v-else-if="input.type === 'ARRAY'">
      <div class="collection-container">
        <h4 v-if="input.label">A-{{ input.label }}</h4>
        <p v-if="input.description" class="text-caption mb-2">
          {{ input.description }}
        </p>

        <div
          v-if="
            input.items &&
            Object.keys(input.items).length &&
            Object.keys(input.items).length > 0
          "
        >
          <v-card
            v-for="(item, index) in Object.keys(input.items)"
            :key="`collection-${level.join('-')}-${index}`"
            class="mb-3 pa-3"
            variant="outlined"
          >
            <div class="d-flex justify-between align-center mb-2">
              <h5>{{ $t(input.label) || `Item ${index + 1}` }}</h5>
              <v-btn
                icon="mdi-delete"
                size="small"
                color="error"
                variant="text"
                @click="deleteItem(index)"
              />
            </div>

            <FormOrganismsRecursiveFormblock
              v-for="(field, fieldIndex) in input.items"
              :key="`field-${index}-${fieldIndex}`"
              :input="field"
              :category
              :level="[...level, index, field.key]"
              :saving
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
    <template v-else-if="input.type === 'OBJECT'">
      <div class="object-container">
        <h4 v-if="input.label">O-{{ $t(input.label) }}</h4>
        <p v-if="input.description" class="text-caption mb-2">
          {{ input.description }}
        </p>

        <component
          :is="getComponentName(input.component)"
          v-if="computeInputVisibility(input)"
          :args="{ ...input, key: lastLevelItem }"
          :level
          :category
          :disabled="saving"
        />
      </div>
    </template>
    <!-- Document Form Block -->
    <template v-else-if="input.type === 'DOCUMENT'">
      <div class="document-container">
        <h4 v-if="input.label">D-{{ $t(input.label) }}</h4>
        <p v-if="input.description" class="text-caption mb-2">
          {{ input.description }}
        </p>

        <v-card class="pa-3" variant="outlined">
          <component
            :is="getComponentName(input.component)"
            v-if="computeInputVisibility(input)"
            :args="{ ...input, key: lastLevelItem }"
            :level
            :category
            :disabled="saving"
          />
        </v-card>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue"
import {
  getComponentName,
  computeInputVisibility,
} from "../../../composables/useFormDisplay"
import { useFormStore } from "../../../stores/form"
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
    store: formStore[props.category],
  })
})

const isArray = (items) => {
  return Array.isArray(items)
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
console.log("RecursiveFormblock props:", props)
onMounted(() => {
  console.log("RecursiveFormblock mounted:", props.type)
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
