<template>
  {{ args }}
  <v-card
    v-for="(item, index) in args.items"
    :key="`col-${level.join('-')}-${index}`"
    class="mb-3 pa-3"
    variant="outlined"
  >
    <component
      :is="getComponentName(item.component)"
      v-if="computeInputVisibility(item)"
      :key="index"
      :args="{ ...item, key: lastLevelItem }"
      :level
      :category
      :disabled="saving"
    />
  </v-card>
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
const formStore = useFormStore()
const props = defineProps({
  args: {
    type: Object,
    default: () => {
      return {}
    },
  },
  level: {
    type: Array,
    default: () => [],
  },
  saving: {
    type: Boolean,
    default: false,
  },
  rootIndex: {
    type: Number,
    default: null,
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
</script>
<style lang="scss"></style>
