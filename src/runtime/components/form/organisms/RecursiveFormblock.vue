<template>
  <div class="recursive-form-block">
    <!-- PRIMITIVE -->
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

    <!-- ARRAY -->
    <template v-else-if="input.type === 'ARRAY'">
      <div class="collection-container">
        <h4 v-if="input.label">{{ $t(input.label) }}</h4>
        <p v-if="input.description" class="text-caption mb-2">
          {{ input.description }}
        </p>

        <v-card
          v-for="(item, index) in input.items"
          :key="`col-${level.join('-')}-${index}`"
          class="mb-3 pa-3"
          variant="outlined"
        >
          {{ item }}
          <!--          <div class="d-flex justify-between align-center mb-2">
            <h5>{{ $t(item.label) || `Item ${index + 1}` }}</h5>
            <v-btn
              icon="mdi-delete"
              size="small"
              variant="outlined"
              @click="deleteItem(index)"
            />
          </div> -->
          <!--         <FormOrganismsRecursiveFormblock
            :input="item"
            :category
            :level="[...props.level, index]"
            :saving
            :root-index="index"
          /> -->
        </v-card>

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

    <!-- OBJECT -->
    <template v-else-if="input.type === 'OBJECT'">
      <div class="object-container">
        <h4 v-if="input.label">{{ $t(input.label) }}</h4>
        <p v-if="input.description" class="text-caption mb-2">
          {{ input.description }}
        </p>
      </div>

      <component
        :is="getComponentName(input.component)"
        v-if="computeInputVisibility(input)"
        :args="{ ...input, key: lastLevelItem }"
        :level
        :category
        :disabled="saving"
      />
    </template>

    <!-- DOCUMENT -->
    <template v-else-if="input.type === 'DOCUMENT'">
      <div class="document-container">
        <h4 v-if="input.label">{{ $t(input.label) }}</h4>
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
import { computed } from "vue"
import {
  getComponentName,
  computeInputVisibility,
} from "../../../composables/useFormDisplay"
import { useFormStore } from "../../../stores/form"

const props = defineProps({
  input: { type: Object, required: true },
  category: { type: String, required: true },
  level: { type: Array, required: true },
  saving: { type: Boolean, default: false },
  rootIndex: { type: Number, default: 0 },
})

const formStore = useFormStore()

const lastLevelItem = computed(() => props.level[props.level.length - 1])

const wrapperKey = computed(() => {
  const it = props.input?.items
  if (!it || Array.isArray(it)) return null
  const keys = Object.keys(it || {})
  if (keys.length !== 1) return null
  const k = keys[0]
  const node = it[k]
  return node && typeof node === "object" ? k : null
})

const itemFieldsSchema = computed(() => {
  const it = props.input?.items
  if (!it) return {}

  if (Array.isArray(it)) {
    return it[0] || {}
  }

  const k = wrapperKey.value
  if (k && it[k]?.type === "OBJECT" && it[k]?.items) {
    return it[k].items
  }

  return it
})

const defaultForPrimitive = (s) => {
  if (Object.prototype.hasOwnProperty.call(s, "default")) return s.default
  if (s.component === "Checkbox") return false
  return ""
}
const buildDefaultFromSchema = (node) => {
  if (!node || typeof node !== "object") return null
  const t = node.type
  if (t === "PRIMITIVE" || t === "DOCUMENT") return defaultForPrimitive(node)
  if (t === "ARRAY") return []
  if (t === "OBJECT") {
    const out = {}
    const items = node.items || {}
    for (const k of Object.keys(items))
      out[k] = buildDefaultFromSchema(items[k])
    return out
  }

  const out = {}
  for (const k of Object.keys(node)) out[k] = buildDefaultFromSchema(node[k])
  return out
}
const itemTemplate = computed(() => {
  const fields = itemFieldsSchema.value
  const k = wrapperKey.value

  const core = {}
  for (const f of Object.keys(fields)) {
    core[f] = buildDefaultFromSchema(fields[f])
  }

  return k ? { [k]: core } : core
})

const addItem = () => {
  formStore.addFormItem({
    key: lastLevelItem.value,
    category: props.category,
    level: props.level,
    defaults: itemTemplate.value,
  })
}

const deleteItem = (index) => {
  formStore.deleteFormItem({
    key: lastLevelItem.value,
    category: props.category,
    level: [...props.level, index],
  })
}
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
