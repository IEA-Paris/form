<template>
  <v-card>
    <v-card-title class="text-h6">
      {{ $t("document-picker") }}
    </v-card-title>
    <v-card-text>
      <template v-if="suggestedPicks.length > 0" />
      <template v-else>
        <v-alert type="info" variant="outlined" class="mt-2">
          {{ $t("document-picker-no-suggestions") }}
        </v-alert>
        <!-- Suggested picks -->
        <slot /> </template
    ></v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn color="default" variant="outlined" append-icon="mdi-magnify"
        >Search</v-btn
      >
    </v-card-actions>
  </v-card>
</template>
<script setup lang="ts">
// import { useDisplay } from "vuetify"
// const { smAndUp } = useDisplay()
// const localePath = useLocalePath()
import { useFormStore } from "../../../stores/form"
const formStore = useFormStore()
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
  // type of the document picker, e.g. "event", "image", etc.
  type: {
    type: String,
    required: true,
    default: "document",
  },
  // category the document related to,
  // e.g. for events related to a people, events is type, people is category
  category: {
    type: String,
    required: true,
    default: "document",
  },
})
const suggestedPicks = computed(() => {
  return formStore?.getSuggestedPicks(props.category, props.type)
})
</script>
<style lang="scss"></style>
