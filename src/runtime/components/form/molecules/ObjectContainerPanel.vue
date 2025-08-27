<template>
  <v-card>
    {{ level }}

    <slot />
  </v-card>
</template>
<script setup>
// import { useDisplay } from "vuetify"
// const { smAndUp } = useDisplay()
// const localePath = useLocalePath()

const props = defineProps({
  args: {
    type: Object,
    default: () => {
      return {}
    },
  },
  level: {
    type: Array,
    required: false,
    default: () => {
      return []
    },
  },
  category: {
    type: String,
    default: "",
  },
  saving: {
    type: Boolean,
    required: false,
    default: false,
  },
})
</script>
<style lang="scss"></style>
