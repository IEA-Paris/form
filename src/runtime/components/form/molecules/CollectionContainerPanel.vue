<template>
  <v-card
    :key="`col-${level.join('-')}-${lastLevelItem}`"
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
      <!-- then use the schema to render the proper component for each item -->
      <template
        v-for="(key, keyIndex) in Object.keys(args.items)"
        :key="keyIndex"
      >
        <component
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
const lastLevelItem = computed(() => props.level[props.level.length - 1])

const addItem = () => {
  formStore.addFormItem({
    category: props.category,
    level: props.level,
  })
}
const deleteItem = (index) => {
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
</script>
<style lang="scss"></style>
