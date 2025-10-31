<template>
  <div class="document-picker">
    <!-- Display selected items -->
    <div v-if="val && val.length > 0" class="selected-items mb-4">
      <div
        class="text-overline d-flex align-center justify-space-between mt-3 ml-3"
      >
        <template v-if="args.key">
          {{ $t(args.key, 2) }}
        </template>
      </div>
      <div
        v-for="(item, index) in val"
        :key="item.id || index"
        class="selected-item mb-2"
      >
        <component :is="getDenseItemComponent" :item />
        <v-btn
          icon="mdi-close"
          size="x-small"
          variant="text"
          class="remove-btn"
          @click="removeItem(index)"
        />
      </div>
    </div>

    <!-- Search input with manual dropdown -->
    <v-menu
      v-model="menuOpen"
      :close-on-content-click="false"
      location="bottom"
      max-height="400"
    >
      <template #activator="{ props: menuProps }">
        <v-text-field
          v-model="searchQuery"
          v-bind="menuProps"
          :label="$t(args.label)"
          :placeholder="$t('document-picker-search-placeholder')"
          :loading="loading"
          clearable
          hide-details="auto"
          @input="onSearchInput"
          @focus="onFocus"
        />
      </template>

      <v-card v-if="searchQuery && searchQuery.length >= 2">
        <v-list v-if="searchResults.length > 0">
          <v-list-item
            v-for="item in searchResults"
            :key="item.id"
            @click="onItemSelect(item)"
          >
            <component :is="getDenseItemComponent" :item="item" />
          </v-list-item>
        </v-list>

        <v-list v-else-if="!loading">
          <v-list-item>
            <v-list-item-title>
              {{ $t("document-picker-no-results") }}
            </v-list-item-title>
          </v-list-item>
        </v-list>

        <v-list v-else>
          <v-list-item>
            <v-list-item-title>
              {{ $t("document-picker-searching") }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card>

      <v-card v-else-if="searchQuery && searchQuery.length < 2">
        <v-list>
          <v-list-item>
            <v-list-item-title>
              {{ $t("document-picker-type-more") }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card>
    </v-menu>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue"
import { useFormStore } from "../../../stores/form"

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

// Reactive state
const searchQuery = ref("")
const loading = ref(false)
const searchResults = ref([])
const menuOpen = ref(false)
console.log(
  `List${
    props.args.key.charAt(0).toUpperCase() + props.args.key.slice(1)
  }DenseItem`
)
// Dynamically resolve the dense item component name
const getDenseItemComponent = computed(() =>
  resolveComponent(
    `${
      props.args.key.charAt(0).toUpperCase() + props.args.key.slice(1)
    }DenseItem`
  )
)

// Dynamically import and resolve the GraphQL query
const getGraphQLQuery = async () => {
  // Use explicit imports for Vite to analyze properly
  switch (props.args.key) {
    case "events":
      return (
        await import(
          "@paris-ias/trees/dist/graphql/client/events/query.list.events.gql"
        )
      ).default
    case "people":
      return (
        await import(
          "@paris-ias/trees/dist/graphql/client/people/query.list.people.gql"
        )
      ).default
    case "news":
      return (
        await import(
          "@paris-ias/trees/dist/graphql/client/news/query.list.news.gql"
        )
      ).default
    case "publications":
      return (
        await import(
          "@paris-ias/trees/dist/graphql/client/publications/query.list.publications.gql"
        )
      ).default
    case "affiliations":
      return (
        await import(
          "@paris-ias/trees/dist/graphql/client/affiliations/query.list.affiliations.gql"
        )
      ).default
    case "fellowships":
      return (
        await import(
          "@paris-ias/trees/dist/graphql/client/fellowships/query.list.fellowships.gql"
        )
      ).default
    case "tags":
      return (
        await import(
          "@paris-ias/trees/dist/graphql/client/misc/query.list.tags.gql"
        )
      ).default
    case "projects":
      return (
        await import(
          "@paris-ias/trees/dist/graphql/client/projects/query.list.projects.gql"
        )
      ).default
    default:
      throw new Error(`Unsupported category: ${props.args.key}`)
  }
}

// Computed property for the value in the store
const val = computed({
  get() {
    return formStore.getKey({
      level: props.level,
      store: formStore[props.category],
    })
  },
  set(value) {
    console.log("value: ", value)
    formStore.setKey({
      value: value.map((el) => el.slug),
      category: props.category,
      level: props.level,
      store: formStore[props.category],
    })
  },
})

// Search function using GraphQL
const performSearch = async (query) => {
  if (!query || query.length < 2) {
    searchResults.value = []
    return
  }

  loading.value = true

  try {
    const { $apollo } = useNuxtApp()
    const graphqlQuery = await getGraphQLQuery()

    const result = await $apollo.defaultClient.query({
      query: graphqlQuery,
      variables: {
        options: {
          search: query,
          limit: 50,
          skip: 0,
          sortBy: ["score"],
          sortDesc: [true],
        },
        lang: "en",
      },
    })

    // Extract the data for the current type
    const queryName = `list${
      props.args.key.charAt(0).toUpperCase() + props.args.key.slice(1)
    }`
    const data = result.data[queryName]
    console.log("data: ", data)

    if (data && data.items) {
      // Sort by score
      searchResults.value = [...data.items].sort(
        (a, b) => (b.score || 0) - (a.score || 0)
      )
    } else {
      searchResults.value = []
    }
  } catch (error) {
    console.error("Search error:", error)
    searchResults.value = []
  } finally {
    loading.value = false
  }
}

// Debounced search input handler
let searchTimeout = null
const onSearchInput = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  searchTimeout = setTimeout(() => {
    performSearch(searchQuery.value)
  }, 300) // 300ms debounce
}

// Handle focus - open menu if there are results
const onFocus = () => {
  if (searchQuery.value && searchQuery.value.length >= 2) {
    menuOpen.value = true
  }
}

// Handle item selection
const onItemSelect = (item) => {
  if (!item) return

  // Add to existing array or create new array
  const currentValue = val.value || []

  // Check if item is already selected
  const isAlreadySelected = currentValue.some(
    (selectedItem) => selectedItem.id === item.id
  )

  if (!isAlreadySelected) {
    val.value = [...currentValue, item]
  }

  // Close menu after selection
  menuOpen.value = false
}

// Remove item from selection
const removeItem = (index) => {
  const currentValue = val.value || []
  val.value = currentValue.filter((_, i) => i !== index)
}

// Watch menu state to trigger search when opened
watch(menuOpen, (isOpen) => {
  if (isOpen && searchQuery.value && searchQuery.value.length >= 2) {
    performSearch(searchQuery.value)
  }
})
</script>

<style lang="scss" scoped>
.document-picker {
  margin-top: 16px;

  .selected-items {
    .selected-item {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
      border-radius: 4px;
      padding: 8px;
      background-color: rgba(var(--v-theme-surface), 1);

      &:hover {
        background-color: rgba(var(--v-theme-surface-variant), 0.5);
      }

      .remove-btn {
        flex-shrink: 0;
        margin-left: 8px;
      }
    }
  }
}
</style>
