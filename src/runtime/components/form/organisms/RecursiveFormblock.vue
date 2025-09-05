<template>
  <div class="recursive-form-block">
    <!-- PRIMITIVE -->
    <template v-if="input.type === 'PRIMITIVE'">
      <component
        :is="getComponentName(input.component)"
        v-if="computeInputVisibility(input)"
        :args="{ ...input, key: level[level.length - 1] }"
        :level="level"
        :category="category"
      />
    </template>

    <!-- ARRAY -->
    <template v-else-if="input.type === 'ARRAY'">
      <div class="collection-container">
        <template v-if="hasCollectionSort">
          <component
            :is="getComponentName(input.component)"
            v-if="computeInputVisibility(input)"
            :args="{ ...input, key: level[level.length - 1] }"
            :level="level"
            :category="category"
          />
        </template>

        <template v-else>
          <ClientOnly>
            <draggable v-if="computeInputVisibility(input)" :list="arrayItems">
              handle=".drag-handle" :disabled="saving" :animation="150"
              class="dnd-list" >
              <template #item="{ element, index }">
                <div class="dnd-item">
                  <span class="drag-handle" aria-label="Drag" title="Drag"
                    >⋮⋮</span
                  >

                  <!-- auto-récursion sur CHAQUE item -->
                  <FormOrganismsRecursiveFormblock
                    :input="childSchema"
                    :category="category"
                    :level="[...level, index]"
                    :saving="saving"
                  />
                </div>
              </template>
            </draggable>
          </ClientOnly>
        </template>
      </div>
    </template>

    <!-- OBJECT -->
    <template v-else-if="input.type === 'OBJECT'">
      <component
        :is="getComponentName(input.component)"
        v-if="computeInputVisibility(input)"
        :args="{ ...input, key: level[level.length - 1] }"
        :level="level"
        :category="category"
      />
    </template>

    <!-- DOCUMENT -->
    <template v-else-if="input.type === 'DOCUMENT'">
      <component
        :is="getComponentName(input.component)"
        v-if="computeInputVisibility(input)"
        :args="{ ...input, key: level[level.length - 1] }"
        :level="level"
        :category="category"
        :type="input.type"
      />
    </template>
  </div>
</template>

<script setup>
import { computed } from "vue"
import draggable from "vuedraggable"
import { useFormStore } from "../../../stores/form"
import {
  getComponentName,
  computeInputVisibility,
} from "../../../composables/useFormDisplay"

defineOptions({ name: "FormOrganismsRecursiveFormblock" })

const props = defineProps({
  input: { type: Object, required: true },
  category: { type: String, required: true },
  level: { type: Array, required: true },
  saving: { type: Boolean, default: false },
})

const formStore = useFormStore()

const hasCollectionSort = computed(() => {
  const sort =
    props.input?.sort ??
    props.input?.list?.sort ??
    props.input?.collection?.sort
  return Array.isArray(sort) ? sort.length > 0 : !!sort
})

const arrayItems = computed({
  get() {
    const mod = formStore[props.category]
    const arr = formStore.getKey({ level: props.level, store: mod })
    return Array.isArray(arr) ? arr : []
  },
  set(v) {
    formStore.setKey({
      category: props.category,
      level: props.level,
      value: v,
    })
  },
})

const childSchema = computed(() => {
  return (
    props.input?.children ??
    props.input?.of ??
    props.input?.item ??
    props.input?.elementSchema ?? {
      type: "PRIMITIVE",
      component: props.input?.component,
      label: props.input?.label,
    }
  )
})
</script>

<style lang="scss" scoped>
.recursive-form-block {
  .collection-container {
    margin-bottom: 16px;
  }

  .dnd-list {
    display: grid;
    gap: 12px;
  }

  .dnd-item {
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: start;
    gap: 8px;
    padding: 8px;
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    border-radius: 8px;
  }

  .drag-handle {
    cursor: grab;
    user-select: none;
    padding: 4px 6px;
  }
  .drag-handle:active {
    cursor: grabbing;
  }
}
</style>
