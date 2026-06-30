<template>
  <div class="image-item" @click="$emit('click', item)">
    <v-img
      :src="item.thumb || item.url"
      :alt="item.alt || item.name"
      :aspect-ratio="1"
      cover
      class="image-item__img"
    >
      <template #placeholder>
        <div class="d-flex align-center justify-center fill-height">
          <v-progress-circular indeterminate size="24" />
        </div>
      </template>
    </v-img>
    <div class="image-item__caption">
      {{ item.name }}
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
})

defineEmits(["click"])
</script>

<style lang="scss" scoped>
.image-item {
  position: relative;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  max-width: 300px;
  border: 2px solid rgba(var(--v-border-color), var(--v-border-opacity));
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border-color: rgba(var(--v-theme-primary), 0.5);

    .image-item__caption {
      opacity: 1;
    }
  }

  &__img {
    border-radius: 6px;
  }

  &__caption {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
    color: white;
    padding: 8px;
    font-size: 0.75rem;
    text-align: center;
    opacity: 0;
    transition: opacity 0.2s ease;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
