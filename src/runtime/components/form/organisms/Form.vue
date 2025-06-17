<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-form ref="formRef" v-model="valid">
          <div id="container">
            <template v-for="(input, key, index) in form" :key="key">
              <FormOrganismsRecursiveFormblock
                :input="input"
                :category="category"
                :level="[key]"
                :saving="saving"
                :root-index="index"
              />
            </template>
          </div>

          <div v-if="showActions" class="d-flex justify-end mt-4">
            <v-btn
              :disabled="!valid || saving"
              :loading="saving"
              color="success"
              prepend-icon="mdi-content-save"
              @click.stop="save"
            >
              {{ saveText || "Save" }}
            </v-btn>
          </div>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed, ref, onMounted } from "vue"
import { useFormStore } from "../../../stores/form"
import { useNuxtApp } from "#app"
const { $schemas, $forms } = useNuxtApp()
const props = defineProps({
  category: {
    type: String,
    required: true,
  },
  showActions: {
    type: Boolean,
    default: true,
  },
  saveText: {
    type: String,
    default: "Save",
  },
})

const emit = defineEmits(["save", "validate"])
const form = computed(() => $schemas?.[props.category] || {})
const formStore = useFormStore()
const valid = ref(false)
const saving = ref(false)
const formRef = ref(null)
/* if (!formStore[props.category]) {
  console.log("Adding module to form store:", props.category)
  formStore.addModule(props.category, $forms[props.category])
} */
const save = async () => {
  if (valid.value) {
    saving.value = true
    try {
      const result = await formStore.save(props.category)
      emit("save", result)
    } catch (error) {
      console.error("Error saving form:", error)
    } finally {
      saving.value = false
    }
  }
}

const validate = async () => {
  if (formRef.value) {
    const result = await formRef.value.validate()
    emit("validate", result)
    return result
  }
  return { valid: false }
}

// Expose methods for parent components
defineExpose({
  validate,
  save,
  reset: () => formRef.value?.reset(),
  resetValidation: () => formRef.value?.resetValidation(),
})

onMounted(() => {})
</script>

<style lang="scss" scoped>
#container {
  .v-input {
    margin-bottom: 16px;
  }
}
</style>
