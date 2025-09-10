<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-items-right">
          <v-btn
            icon
            :color="showOptions ? 'primary' : ''"
            @click="showOptions = !showOptions"
          >
            <v-icon>{{ showOptions ? "mdi-eye-off" : "mdi-eye" }}</v-icon>
          </v-btn>
        </div>
        <v-form ref="formRef" v-model="valid" fast-fail @submit.prevent>
          <div :class="valid ? 'text-green' : 'text-red'">
            THE WHOLE FORM IS {{ valid ? "VALID" : "INVALID" }}
          </div>
          <template v-for="(input, key, index) in form" :key="key">
            <!-- {{ input }}
              {{ key }}
              {{ index }} -->
            <FormOrganismsRecursiveFormblock
              :input
              :category
              :level="[key]"
              :saving
              :root-index="index"
            />
          </template>

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
import { useFormStore } from "../../../stores/form"
import { useNuxtApp } from "#app"
const { $schemas } = useNuxtApp()
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
const showOptions = ref(false)
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
</script>

<style lang="scss" scoped>
#container {
  .v-input {
    margin-bottom: 16px;
  }
}
</style>
