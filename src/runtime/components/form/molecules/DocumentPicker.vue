<template>
  <div class="document-picker">
    <v-autocomplete
      v-model="selectedItem"
      :items="autocompleteItems"
      :loading="loading"
      :search="searchQuery"
      :label="$t(args.label)"
      :placeholder="$t('document-picker-search-placeholder')"
      item-title="title"
      item-value="id"
      return-object
      clearable
      hide-details="auto"
      @update:search="onSearchInput"
      @update:model-value="onItemSelect"
    >
      <template #item="{ props: itemProps, item }">
        <!-- Render picker item components for search results -->
        <template v-if="item.raw.type !== 'new'">
          <component
            :is="getPickerItemComponentName(category)"
            v-bind="itemProps"
            :item="item.raw"
            @click="onItemSelect(item.raw)"
          />
        </template>

        <!-- Render "New" button -->
        <template v-else>
          <v-list-item
            v-bind="itemProps"
            :title="$t('document-picker-create-new')"
            prepend-icon="mdi-plus"
            class="new-item-button"
            @click="onCreateNew"
          />
        </template>
      </template>

      <template #no-data>
        <v-list-item>
          <v-list-item-title>
            {{
              loading
                ? $t("document-picker-searching")
                : $t("document-picker-no-results")
            }}
          </v-list-item-title>
        </v-list-item>
      </template>
    </v-autocomplete>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue"
import { useFormStore } from "../../../stores/form"
import { getPickerItemComponentName } from "../../../composables/useFormDisplay"

const formStore = useFormStore()

const props = defineProps({
  args: {
    type: Object,
    default: () => ({}),
  },
  level: {
    type: Array,
    default: () => [],
  },
  category: {
    type: String,
    required: true,
  },
  saving: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(["update:valid", "create-new"])

// Reactive state
const selectedItem = ref(null)
const searchQuery = ref("")
const loading = ref(false)
const searchResults = ref([])

// Computed property for autocomplete items
const autocompleteItems = computed(() => {
  const items = searchResults.value.map((item) => ({
    ...item,
    title: getItemTitle(item),
    type: "result",
  }))

  // Add "New" option at the end
  items.push({
    id: "new",
    title: "Create New",
    type: "new",
  })

  return items
})

// Helper function to get item title based on category
const getItemTitle = (item) => {
  switch (props.category) {
    case "people":
      return `${item.firstname || ""} ${item.lastname || ""}`.trim()
    case "event":
    case "events":
      return item.name || item.title
    case "affiliation":
    case "affiliations":
      return item.name
    default:
      return (
        item.name ||
        item.title ||
        item.firstname + " " + item.lastname ||
        "Unknown"
      )
  }
}

// Search function using GraphQL
const performSearch = async (query) => {
  if (!query || query.length < 2) {
    searchResults.value = []
    return
  }

  loading.value = true

  try {
    // For now, we'll use a mock search - replace with actual GraphQL call
    // when Apollo client is properly configured

    // Mock data based on category
    const mockData = getMockSearchResults(query, props.category)

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Limit to 5 results as requested
    searchResults.value = mockData.slice(0, 5)

    /* 
    // Uncomment and use this when GraphQL is properly set up:
    const { $apollo } = useNuxtApp()
    const result = await $apollo.defaultClient.query({
      query: searchQuery,
      variables: {
        search: query,
        lang: 'en'
      }
    })

    const categoryData = result.data.search[props.category] || result.data.search[props.category + 's']
    
    if (categoryData && categoryData.items) {
      searchResults.value = categoryData.items.slice(0, 5)
    } else {
      searchResults.value = []
    }
    */
  } catch (error) {
    console.error("Search error:", error)
    searchResults.value = []
  } finally {
    loading.value = false
  }
}

// Mock search results for demonstration
const getMockSearchResults = (query, category) => {
  const mockResults = {
    people: [
      {
        id: "1",
        firstname: "John",
        lastname: "Doe",
        image: { url: "", alt: "" },
      },
      {
        id: "2",
        firstname: "Jane",
        lastname: "Smith",
        image: { url: "", alt: "" },
      },
      {
        id: "3",
        firstname: "Bob",
        lastname: "Johnson",
        image: { url: "", alt: "" },
      },
    ],
    events: [
      {
        id: "1",
        name: "Conference 2024",
        date: "2024-06-15",
        image: { url: "", alt: "" },
      },
      {
        id: "2",
        name: "Workshop Series",
        date: "2024-07-20",
        image: { url: "", alt: "" },
      },
      {
        id: "3",
        name: "Research Symposium",
        date: "2024-08-10",
        image: { url: "", alt: "" },
      },
    ],
    affiliations: [
      {
        id: "1",
        name: "University of Example",
        type: "Academic",
        image: { url: "", alt: "" },
      },
      {
        id: "2",
        name: "Research Institute",
        type: "Research",
        image: { url: "", alt: "" },
      },
      {
        id: "3",
        name: "Tech Corp",
        type: "Corporate",
        image: { url: "", alt: "" },
      },
    ],
  }

  return mockResults[category] || mockResults[category + "s"] || []
}

// Debounced search input handler
let searchTimeout = null
const onSearchInput = (query) => {
  searchQuery.value = query

  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  searchTimeout = setTimeout(() => {
    performSearch(query)
  }, 300) // 300ms debounce
}

// Handle item selection
const onItemSelect = (item) => {
  if (!item || item.type === "new") return

  selectedItem.value = item

  // Update form store with selected value
  formStore.updateFormData({
    category: props.category,
    level: props.level,
    value: item,
  })

  emit("update:valid", true)
}

// Handle create new action
const onCreateNew = () => {
  emit("create-new", {
    category: props.category,
    searchQuery: searchQuery.value,
  })
}

// Watch for external value changes
watch(
  () =>
    formStore.getKey({
      level: props.level,
      store: formStore[props.category],
    }),
  (newValue) => {
    selectedItem.value = newValue
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.document-picker {
  .new-item-button {
    border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    background-color: rgba(var(--v-theme-primary), 0.1);

    &:hover {
      background-color: rgba(var(--v-theme-primary), 0.2);
    }
  }
}
</style>
