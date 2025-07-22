<template>
  <div class="pa-4">
    <h1>ObjectKeyPairContainer Test</h1>

    <v-container>
      <v-row>
        <v-col cols="12">
          <h2>Social Networks Test</h2>
          <p>
            Testing the ObjectKeyPairContainer component for social networks
          </p>

          <FormMoleculesObjectKeyPairContainer
            :args="{
              key: 'socials',
              label: 'Social Networks',
              description: 'Add your social media profiles and website links',
            }"
            category="people"
            :level="['socials']"
            :saving="false"
          />
        </v-col>
      </v-row>

      <v-row class="mt-4">
        <v-col cols="12">
          <h3>Form Store Debug</h3>
          <v-card class="pa-4" variant="outlined">
            <h4>Current People Data:</h4>
            <pre>{{ JSON.stringify(peopleData, null, 2) }}</pre>

            <h4>Social Networks Data:</h4>
            <pre>{{ JSON.stringify(socialsData, null, 2) }}</pre>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-4">
        <v-col cols="12">
          <v-card class="pa-4" variant="outlined">
            <h4>Actions:</h4>
            <v-btn color="primary" class="mr-2" @click="initializeData">
              Initialize Test Data
            </v-btn>
            <v-btn color="error" class="mr-2" @click="clearData">
              Clear Data
            </v-btn>
            <v-btn color="info" @click="logFormStore"> Log Form Store </v-btn>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { computed } from "vue"
import { useFormStore } from "../../src/runtime/stores/form"

const formStore = useFormStore()

// Initialize the people module in the store if it doesn't exist
if (!formStore.people) {
  formStore.$patch({
    people: {
      source: "test",
      form: {
        values: {
          socials: {},
        },
        _defaults: {},
        schema: {},
      },
      loading: false,
      current: null,
      resetFilters: false,
    },
  })
}

const peopleData = computed(() => formStore.people?.form?.values || {})
const socialsData = computed(
  () => formStore.people?.form?.values?.socials || {}
)

const initializeData = () => {
  console.log("Initializing test data...")
  formStore.updateForm({
    key: "socials",
    value: {
      twitter: "@johndoe",
      linkedin: "https://linkedin.com/in/johndoe",
      github: "https://github.com/johndoe",
    },
    category: "people",
    level: ["socials"],
  })
}

const clearData = () => {
  console.log("Clearing data...")
  formStore.updateForm({
    key: "socials",
    value: {},
    category: "people",
    level: ["socials"],
  })
}

const logFormStore = () => {
  console.log("FormStore:", formStore)
  console.log("People data:", formStore.people)
  console.log("Socials data:", socialsData.value)
}

console.log("ObjectKeyPairContainer test page loaded")
console.log("FormStore:", formStore)
</script>

<style scoped>
pre {
  background-color: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
