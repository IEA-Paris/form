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
    required: true,
    default: () => {
      return {}
    },
  },
  level: {
    type: Array,
    required: false,
  },
})
</script>
<style lang="scss"></style>
