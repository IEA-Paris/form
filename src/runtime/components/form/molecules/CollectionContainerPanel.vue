<template>
  <v-card
    :key="`col-${level.join('-')}-${lastLevelItem}`"
    class="mb-3 pa-3"
    variant="outlined"
  >
    <v-card-title v-if="args.label">
      {{ $t(args.label) }}
    </v-card-title>
    <v-card-text v-if="args.description" class="text-caption mb-2">
      {{ args.description }}
    </v-card-text>
    <!-- start by iterating on the actual items in the array -->
    <template v-for="(item, index) in val" :key="index">
      <!-- then use the schema to render the proper component for each item -->
      <template v-for="(key, keyIndex) in Object.keys(args.items)" :key="index">
        <component
          :is="getComponentName(args.items[key].component)"
          :category
          :args="{ ...args.items[key], index }"
          :level="[...level, index, key]"
          :disabled="saving"
          :saving
        /> </template></template
  ></v-card>
  <v-btn
    icon="mdi-delete"
    size="small"
    variant="outlined"
    @click="deleteItem(fieldIndex)"
  />
  <v-btn
    prepend-icon="mdi-plus"
    color="primary"
    variant="outlined"
    class="mt-2"
    @click="addItem"
  >
    {{ (args && args.addText) || "Add Item" }}
  </v-btn>
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
const val = computed(() => {
  return formStore.getKey({
    level: props.level,
    store: formStore[props.category],
  })
})
</script>
<style lang="scss"></style>
