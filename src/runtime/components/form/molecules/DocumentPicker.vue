<template>
  <div class="document-picker">
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
          :loading
          clearable
          hide-details="auto"
          @input="onSearchInput"
          @focus="onFocus"
          @blur="onBlur"
        />
      </template>

      <v-card v-if="searchQuery && searchQuery.length >= 2">
        <v-list v-if="searchResults.length > 0">
          <v-list-item
            v-for="item in searchResults"
            :key="item.slug"
            @click="onItemSelect(item)"
          >
            <component :is="getDenseItemComponent" :item="item" :loading />
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
    <!-- Display selected items -->
    <div v-if="val && val.length > 0" class="selected-items mb-4 ml-3">
      <div class="text-overline d-flex align-center justify-space-between mt-3">
        <template v-if="args.key">
          {{ $t(args.key, 2) }}
        </template>
      </div>
      <div
        v-for="(item, index) in val"
        :key="item.slug || index"
        class="selected-item mb-2 ml-3"
        draggable="true"
        @dragstart="onDragStart(index, $event)"
        @dragover="onDragOver($event)"
        @drop="onDrop(index, $event)"
        @dragenter="onDragEnter(index, $event)"
        @dragleave="onDragLeave($event)"
        :class="{ 'drag-over': dragOverIndex === index }"
      >
        <v-icon class="drag-handle" icon="mdi-drag-vertical" size="large" />
        <component :is="getDenseItemComponent" :item class="flex-grow-1" />
        <div class="item-actions">
          <v-tooltip :text="$t('move-up')">
            <template v-slot:activator="{ props }">
              <v-btn
                icon="mdi-chevron-up"
                size="small"
                v-bind="props"
                variant="tonal"
                :disabled="index === 0"
                @click="moveItem(index, index - 1)"
              ></v-btn>
            </template>
          </v-tooltip>
          <v-tooltip :text="$t('remove-item')">
            <template v-slot:activator="{ props }">
              <v-btn
                icon="mdi-close"
                size="small"
                v-bind="props"
                variant="tonal"
                @click="removeItem(index)"
              ></v-btn>
            </template>
          </v-tooltip>
          <v-tooltip :text="$t('move-down')">
            <template v-slot:activator="{ props }">
              <v-btn
                icon="mdi-chevron-down"
                size="small"
                v-bind="props"
                variant="tonal"
                :disabled="index === val.length - 1"
                @click="moveItem(index, index + 1)"
              ></v-btn>
            </template>
          </v-tooltip>
        </div>
      </div>
    </div>
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
const draggedIndex = ref(null)
const dragOverIndex = ref(null)

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
    //!\ TODO import mappings from trees
    // Define which fields to keep for each document type
    const fieldMappings = {
      people: ["slug", "firstname", "lastname", "image"],
      default: ["slug", "name", "description", "image", "url", "category"],
    }
    const fieldsToKeep = fieldMappings[props.args.key] || fieldMappings.default

    // Get current value from store
    const currentValue =
      formStore.getKey({
        level: props.level,
        store: formStore[props.category],
      }) || []

    // If value is an array, push new items into existing array
    const newItems = Array.isArray(value) ? value : [value]
    const mappedNewItems = newItems.map((el) =>
      Object.fromEntries(fieldsToKeep.map((field) => [field, el[field]]))
    )

    formStore.setKey({
      value: [...currentValue, ...mappedNewItems],
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
  menuOpen.value = true
}

// Handle blur - close menu
const onBlur = () => {
  // Delay closing to allow click events on menu items to fire
  setTimeout(() => {
    menuOpen.value = false
  }, 200)
}

// Handle item selection
const onItemSelect = (item) => {
  if (!item) return

  // Add to existing array or create new array
  const currentValue = val.value || []

  // Check if item is already selected (use slug as unique identifier)
  const isAlreadySelected = currentValue.some(
    (selectedItem) => selectedItem.slug === item.slug
  )

  if (!isAlreadySelected) {
    // Pass only the new item - the setter will handle appending to the array
    val.value = item
  }

  // Close menu after selection
  menuOpen.value = false
}

// Remove item from selection
const removeItem = (index) => {
  const currentValue = val.value || []
  const updatedValue = currentValue.filter((_, i) => i !== index)

  formStore.setKey({
    value: updatedValue,
    category: props.category,
    level: props.level,
    store: formStore[props.category],
  })
}

// Drag and drop handlers
const onDragStart = (index, event) => {
  draggedIndex.value = index
  event.dataTransfer.effectAllowed = "move"
  event.dataTransfer.setData("text/html", event.target)
}

const onDragOver = (event) => {
  event.preventDefault()
  event.dataTransfer.dropEffect = "move"
}

const onDragEnter = (index, event) => {
  event.preventDefault()
  dragOverIndex.value = index
}

const onDragLeave = (event) => {
  // Only clear if we're leaving the item entirely
  if (!event.currentTarget.contains(event.relatedTarget)) {
    dragOverIndex.value = null
  }
}

const onDrop = (dropIndex, event) => {
  event.preventDefault()
  const dragIndex = draggedIndex.value

  if (dragIndex !== null && dragIndex !== dropIndex) {
    moveItem(dragIndex, dropIndex)
  }

  draggedIndex.value = null
  dragOverIndex.value = null
}

// Move item helper function
const moveItem = (fromIndex, toIndex) => {
  const currentValue = [...(val.value || [])]
  const [movedItem] = currentValue.splice(fromIndex, 1)
  currentValue.splice(toIndex, 0, movedItem)

  formStore.setKey({
    value: currentValue,
    category: props.category,
    level: props.level,
    store: formStore[props.category],
  })
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
      gap: 8px;
      border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
      border-radius: 4px;
      padding: 8px;
      background-color: rgba(var(--v-theme-surface), 1);
      cursor: move;
      transition: all 0.2s ease;

      &:hover {
        background-color: rgba(var(--v-theme-surface-variant), 0.5);
      }

      &.drag-over {
        border-color: rgba(var(--v-theme-primary), 1);
        border-width: 2px;
        background-color: rgba(var(--v-theme-primary), 0.1);
      }

      .drag-handle {
        flex-shrink: 0;
        cursor: grab;
        color: rgba(var(--v-theme-on-surface), 0.5);

        &:active {
          cursor: grabbing;
        }
      }

      .flex-grow-1 {
        flex: 1;
        min-width: 0;
      }

      .item-actions {
        display: flex;
        flex-direction: column;
        gap: 2px;
        flex-shrink: 0;
      }
    }
  }
}
</style>
