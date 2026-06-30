<template>
  <v-dialog v-model="dialog" max-width="500">
    <template #activator="{ props }">
      <v-btn
        color="red"
        class="ma-2"
        prepend-icon="mdi-trash-can-outline"
        v-bind="props"
      >
        {{ $t("delete") }}
      </v-btn>
    </template>
    <v-card>
      <v-card-title class="text-h5">
        {{ $t("deleteDialog.title") }}
      </v-card-title>
      <v-card-text>
        {{
          $t("deleteDialog.message", {
            type: $t(type),
            name: itemName,
          })
        }}
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="dialog = false">
          {{ $t("cancel") }}
        </v-btn>
        <v-btn
          color="red"
          :loading="loading"
          @click="handleDelete"
          prepend-icon="mdi-trash-can-outline"
        >
          {{ $t("delete") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
const props = defineProps({
  type: {
    type: String,
    required: true,
  },
  itemName: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(["deleted"])

const dialog = ref(false)
const loading = ref(false)
const { $queries } = useNuxtApp()

const handleDelete = async () => {
  loading.value = true
  try {
    // Call the deleteFile mutation
    await $queries.deleteFile({
      slug: props.slug,
    })

    // Emit success event
    emit("deleted")
    dialog.value = false

    // Optionally navigate back to list
    const route = useRoute()
    navigateTo(`/${route.params.appId}/${route.params.category}`)
  } catch (error) {
    console.error("Error deleting item:", error)
    // TODO: Show error message to user
  } finally {
    loading.value = false
  }
}
</script>
