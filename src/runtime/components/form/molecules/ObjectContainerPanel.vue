<template>
  <v-card
    :class="{
      valid: valid,
      invalid: !valid,
      required: args.rules && args.rules.required,
    }"
    class="pa-4 mb-4"
  >
    <FormAtomsBlockTitle
      v-if="showLabel(level)"
      :i18n-key="args.key"
      :label="$t(args.label, 2)"
    />
    <div :class="valid ? 'text-green' : 'text-red'">
      THIS OBJECT FORM IS {{ valid ? "VALID" : "INVALID" }}
    </div>
    <v-form
      v-model="valid"
      fast-fail
      @submit.prevent
      @update:model-value="$emit('update:valid', valid)"
    >
      <template v-for="key in Object.keys(args.items)" :key="key">
        <component
          :is="
            getComponentName(args.items[key].component, args.items[key].i18n)
          "
          v-if="computeConditional(args.items[key])"
          :args="{ ...args.items[key], key }"
          :level="[...level, key]"
          :category
        /> </template
    ></v-form>
  </v-card>
</template>
<script setup>
import {
  getComponentName,
  computeConditional,
  showLabel,
} from "../../../composables/useFormDisplay";
const props = defineProps({
  args: {
    type: Object,
    default: () => {
      return {};
    },
  },
  level: {
    type: Array,
    required: false,
    default: () => {
      return [];
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
});

const valid = ref(false);
</script>
<style lang="scss">
.valid.required {
  border-left: solid var(success) 5px !important;
}
.valid:not(.required) {
  border-left: solid grey 5px !important;
}
.invalid.required {
  border-left: solid var(danger) 5px !important;
}
</style>
