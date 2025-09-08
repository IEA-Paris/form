<template>
  <v-list-item
    class="people-picker-item"
    :title="displayName"
    :subtitle="item.affiliation || ''"
    @click="$emit('click', item)"
  >
    <template #prepend>
      <v-avatar size="40">
        <v-img
          v-if="item.image?.url"
          :src="item.image.url"
          :alt="item.image.alt || displayName"
        />
        <v-icon v-else>mdi-account</v-icon>
      </v-avatar>
    </template>

    <template #append>
      <v-icon>mdi-chevron-right</v-icon>
    </template>
  </v-list-item>
</template>

<script setup>
import { computed } from "vue"

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
})

const _emit = defineEmits(["click"])

const displayName = computed(() => {
  return (
    `${props.item.firstname || ""} ${props.item.lastname || ""}`.trim() ||
    "Unknown Person"
  )
})
</script>

<style lang="scss" scoped>
.people-picker-item {
  &:hover {
    background-color: rgba(var(--v-theme-primary), 0.1);
  }
}
</style>
