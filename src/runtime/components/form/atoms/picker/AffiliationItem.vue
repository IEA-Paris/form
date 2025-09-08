<template>
  <v-list-item
    class="affiliation-picker-item"
    :title="item.name"
    :subtitle="item.description || item.type"
    @click="$emit('click', item)"
  >
    <template #prepend>
      <v-avatar size="40" variant="tonal">
        <v-img
          v-if="item.image?.url"
          :src="item.image.url"
          :alt="item.image.alt || item.name"
        />
        <v-icon v-else>mdi-domain</v-icon>
      </v-avatar>
    </template>

    <template #append>
      <v-icon>mdi-chevron-right</v-icon>
    </template>
  </v-list-item>
</template>

<script setup>
const _props = defineProps({
  item: {
    type: Object,
    required: true,
  },
})

const _emit = defineEmits(["click"])
</script>

<style lang="scss" scoped>
.affiliation-picker-item {
  &:hover {
    background-color: rgba(var(--v-theme-primary), 0.1);
  }
}
</style>
