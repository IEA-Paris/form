<template>
  <v-form
    v-model="valid"
    fast-fail
    :class="{
      required: args.rules && args.rules.required,
      valid: valid,
      invalid: !valid,
    }"
    @submit.prevent
    @update:model-value="$emit('update:valid', valid)"
  >
    <FormAtomsBlockTitle
      v-if="showLabel(level)"
      :i18n-key="args.key"
      :label="$t(args.label, 2)"
    />
    <!--     <div :class="valid ? 'text-green' : 'text-red'">
      THIS OBJECT FORM IS {{ valid ? "VALID" : "INVALID" }}
    </div> -->
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
          :is="
            getComponentName(args.items[item].component, args.items[item].i18n)
          "
          v-if="computeConditional(args.items[item])"
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
  </v-form>
</template>
<script setup>
import { useFormStore } from "../../../stores/form"
import {
  getComponentName,
  computeConditional,
  showLabel,
} from "../../../composables/useFormDisplay"
import generateInputRules from "../../../composables/useFormValidation"
import { ref } from "#imports"
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
const valid = ref(false)
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
  formStore.setKey({
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
