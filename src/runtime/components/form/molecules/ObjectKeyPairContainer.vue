<template>
  <div>
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

    <v-select
      v-model="selector"
      variant="outlined"
      :label="$t('add-a-media')"
      :items="
        args.items
          ? Object.keys(args.items).filter((key) => {
              if (selected.includes(key)) {
                return false
              }
              return { title: $t(key), value: key }
            })
          : []
      "
      hide-details
      class="key-pair-item mt-6"
      @update:model-value="updateSelected($event)"
    />
    <div v-for="item in selected" :key="item" class="key-pair-container">
      <template v-if="args.items[item]">
        <component
          :is="getComponentName(args.items[item].component)"
          v-if="computeInputVisibility(args.items[item])"
          class="key-pair-item"
          :args="{ ...args.items[item], key: item }"
          :level="[...props.level, item]"
          :category
          :rules="generateInputRules(args.items[item])"
        />
        <v-btn
          color="default"
          class="key-pair-item delete-button"
          variant="outlined"
          :rounded="false"
          @click="deleteItem(item)"
          ><v-icon>mdi-delete</v-icon></v-btn
        >
      </template>
    </div>
  </div>
</template>
<script setup>
import { useFormStore } from "../../../stores/form"
import {
  getComponentName,
  computeInputVisibility,
} from "../../../composables/useFormDisplay"
import generateInputRules from "../../../composables/useFormValidation"
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
  category: {
    type: String,
    required: true,
  },
})
const selected = ref([])
const selector = ref()

const updateSelected = (item) => {
  console.log("Updating selected: ", item)
  selector.value = null
  selected.value.push(item)
}

const deleteItem = (item) => {
  console.log("Deleting item: ", item)
  selected.value = selected.value.filter((i) => i !== item)
  formStore.updateForm({
    key: props.args.key,
    value: val.value.filter((i) => i !== item),
    category: props.category,
    level: props.level,
    store: formStore[props.category],
  })
}
</script>
<style lang="scss">
.key-pair-container {
  display: flex;
  .key-pair-item {
    margin: 4px;
  }
  .delete-button {
    margin-left: 8px;
    height: auto;
    margin-bottom: 30px;
  }
}
</style>
