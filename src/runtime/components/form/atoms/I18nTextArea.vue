<template>
  <v-row>
    <v-col cols="6">
      <div class="text-overline">
        {{ $t("french-version") }}
      </div>
      <FormAtomsTextArea :args :level="[...level, 'fr']" :category />
    </v-col>
    <v-col cols="6">
      <div class="text-overline">
        {{ $t("english-version") }}
      </div>
      <FormAtomsTextArea :args :level="[...level, 'en']" :category
    /></v-col>
  </v-row>
</template>

<script setup>
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
})
</script>

<style lang="scss" scoped></style>
