<template>
  <v-card>
    {{ val }}

    <slot />
  </v-card>
</template>
<script setup>
// import { useDisplay } from "vuetify"
// const { smAndUp } = useDisplay()
// const localePath = useLocalePath()
import { useFormStore } from "../../../stores/form"

const props = defineProps({
  args: {
    type: Object,
    required: true,
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
    required: false,
  },
  input: {
    type: Object,
    required: true,
  },
  saving: {
    type: Boolean,
    default: false,
  },
})

const formStore = useFormStore()

const val = computed({
  get() {
    return formStore.getKey({
      key: props.args.key,
      level: props.level,
      store: formStore[props.category],
    })
  },
  set(value) {
    console.log("value: ", value)
    formStore.updateForm({
      key: props.args.key,
      value,
      category: props.category,
      level: props.level,
      store: formStore[props.category],
    })
  },
})
</script>
<style lang="scss"></style>
