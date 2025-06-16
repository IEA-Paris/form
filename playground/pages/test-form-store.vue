<template>
  <div>
    <h1>FormStore Test</h1>
    <div v-if="formStore">
      <h2>FormStore State:</h2>
      <pre>{{ JSON.stringify(formStore.$state, null, 2) }}</pre>

      <h2>Available Keys:</h2>
      <ul>
        <li v-for="key in Object.keys(formStore.$state)" :key="key">
          {{ key }}
        </li>
      </ul>

      <h2>People Module (if loaded):</h2>
      <pre v-if="formStore.people">{{
        JSON.stringify(formStore.people, null, 2)
      }}</pre>
      <p v-else>People module not loaded</p>
    </div>
    <div v-else>
      <p>FormStore not available</p>
    </div>

    <h2>Nuxt App Provides:</h2>
    <div v-if="$forms">
      <h3>$forms:</h3>
      <pre>{{ JSON.stringify($forms, null, 2) }}</pre>
    </div>
    <div v-if="$schemas">
      <h3>$schemas:</h3>
      <pre>{{ JSON.stringify($schemas, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup>
import { useFormStore } from "~/modules/form/src/runtime/stores/form"

const formStore = useFormStore()
const { $forms, $schemas } = useNuxtApp()

console.log("FormStore in component:", formStore)
console.log("$forms:", $forms)
console.log("$schemas:", $schemas)
</script>
