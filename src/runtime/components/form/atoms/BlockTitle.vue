<template>
  <div class="text-h6 d-flex align-center justify-space-between mt-3">
    <template v-if="label">
      {{ $t(label, 2) }}
    </template>
    <v-tooltip bottom :disabled="!disabled" :text="$t('disabled-btn-tooltip')">
      <template #activator="{ props }">
        <div v-bind="props" class="d-inline-block">
          <v-btn
            v-if="addBtn"
            prepend-icon="mdi-plus"
            color="primary"
            variant="outlined"
            class="mt-2"
            :disabled
            @click="$emit('add')"
          >
            {{ $t("add." + i18nKey) || "Add Item" }}
          </v-btn>
        </div>
      </template>
    </v-tooltip>
  </div>
</template>
<script setup>
const props = defineProps({
  disabled: {
    type: Boolean,
    required: false,
    default: false,
  },
  label: {
    type: String,
    required: false,
    default: "",
  },
  i18nKey: {
    type: String,
    required: true,
  },
  addBtn: {
    type: Boolean,
    required: false,
    default: false,
  },
})
</script>
