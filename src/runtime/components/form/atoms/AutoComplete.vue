<template>
  <v-autocomplete
    v-model="val"
    v-bind="$attrs"
    :items="computedItems"
    :rules="rules"
    :label="args.label"
    :placeholder="args.placeholder"
    :hint="args.hint"
    :persistent-hint="!!args.hint"
    :required="args.required"
    :disabled="args.disabled"
    :readonly="args.readonly"
    :clearable="args.clearable"
    :multiple="args.multiple"
    :chips="args.chips && args.multiple"
    :item-title="args.itemTitle || 'title'"
    :item-value="args.itemValue || 'value'"
    :return-object="args.returnObject"
    :search="search"
    :loading="loading"
    :no-filter="args.noFilter"
    @update:search="onSearchUpdate"
  />
</template>

<script setup>
import { computed, onMounted, ref } from "vue"
import { useFormStore } from "#imports"

const props = defineProps({
  args: {
    type: Object,
    required: true,
    default: () => ({}),
  },
  level: {
    type: Array,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  items: {
    type: Array,
    default: () => [],
  },
  searchCallback: {
    type: Function,
    default: null,
  },
})

const formStore = useFormStore()
const search = ref("")
const loading = ref(false)

const val = computed({
  get() {
    return formStore.getKey({
      key: props.args.key,
      level: props.level,
      store: formStore[props.category]?.form?.values,
    })
  },
  set(value) {
    formStore.updateForm({
      key: props.args.key,
      value,
      category: props.category,
      level: props.level,
    })
  },
})

const computedItems = computed(() => {
  if (props.args.items) {
    return props.args.items
  }
  return props.items || []
})

const rules = computed(() => {
  const ruleArray = []

  if (props.args.required) {
    ruleArray.push((value) => {
      if (
        value === undefined ||
        value === null ||
        (Array.isArray(value) && value.length === 0) ||
        value === ""
      ) {
        return "This field is required"
      }
      return true
    })
  }

  return ruleArray
})

const onSearchUpdate = async (searchValue) => {
  search.value = searchValue

  if (props.searchCallback && searchValue) {
    loading.value = true
    try {
      await props.searchCallback(searchValue)
    } catch (error) {
      console.error("Search callback error:", error)
    } finally {
      loading.value = false
    }
  }
}

onMounted(() => {
  console.log("AutoComplete mounted with args:", props.args)
})
</script>

<style lang="scss" scoped></style>
