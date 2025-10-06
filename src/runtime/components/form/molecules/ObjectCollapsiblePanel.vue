<template>
  <v-card
    :class="{
      required: args.rules && args.rules.required,
      valid: valid,
      invalid: !valid,
    }"
  >
    <FormAtomsBlockTitle
      v-if="showLabel(level)"
      :i18n-key="args.key"
      :label="$t(args.label, 2)"
    />
    <!--     <div :class="valid ? 'text-green' : 'text-red'">
      THIS OBJECT FORM IS {{ valid ? "VALID" : "INVALID" }}
    </div> -->
    <v-form
      v-model="valid"
      fast-fail
      @submit.prevent
      @update:model-value="$emit('update:valid', valid)"
    >
      <!-- Required fields (always visible) -->
      <template
        v-for="key in Object.keys(args.items).filter(
          (key) => args.items[key]?.rules?.required
        )"
        :key="key"
      >
        <component
          :is="
            getComponentName(args.items[key].component, args.items[key].i18n)
          "
          v-if="computeConditional(args.items[key])"
          :args="{ ...args.items[key], key }"
          :level="[...level, key]"
          :category
        />
      </template>
      <div class="d-flex align-center justify-center">
        <v-btn flat text class="my-2" @click="expanded = !expanded">
          {{ expanded ? $t("collapse") : $t("expand") }}
          <v-icon right>
            {{ expanded ? "mdi-chevron-up" : "mdi-chevron-down" }}
          </v-icon>
        </v-btn>
      </div>
      <!-- Non-required fields (visible when expanded) -->
      <v-expand-transition>
        <div v-show="expanded">
          <template
            v-for="key in Object.keys(args.items).filter(
              (key) => !args.items[key]?.rules?.required
            )"
            :key="key"
          >
            <component
              :is="
                getComponentName(
                  args.items[key].component,
                  args.items[key].i18n
                )
              "
              v-if="computeConditional(args.items[key])"
              :args="{ ...args.items[key], key }"
              :level="[...level, key]"
              :category
            />
          </template>
        </div>
      </v-expand-transition>
    </v-form>
  </v-card>
</template>
<script setup>
import {
  getComponentName,
  computeConditional,
  showLabel,
} from "../../../composables/useFormDisplay"
import { ref } from "#imports"

const _props = defineProps({
  args: {
    type: Object,
    default: () => {
      return {}
    },
  },
  level: {
    type: Array,
    required: false,
    default: () => {
      return []
    },
  },
  category: {
    type: String,
    default: "",
  },
  saving: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const valid = ref(false)
const expanded = ref(false)
</script>
