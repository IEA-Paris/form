<template>
  <div class="image-picker">
    <!-- Search input with manual dropdown -->
    <v-menu
      v-model="menuOpen"
      :close-on-content-click="false"
      location="bottom"
      max-height="500"
      :width="600"
    >
      <template #activator="{ props: menuProps }">
        <v-text-field
          v-model="searchQuery"
          v-bind="menuProps"
          :label="$t(args.label)"
          :placeholder="$t('image-picker-search-placeholder')"
          :loading
          clearable
          hide-details="auto"
          @input="onSearchInput"
          @focus="onFocus"
          @blur="onBlur"
        />
      </template>

      <v-card v-if="searchQuery && searchQuery.length >= 2">
        <v-card-text v-if="searchResults.length > 0" class="pa-2">
          <div class="image-grid">
            <div
              v-for="item in searchResults"
              :key="item.slug"
              class="image-grid-item"
              @click="onItemSelect(item)"
            >
              <v-img
                :src="item.thumb || item.url"
                :alt="item.alt || item.name"
                aspect-ratio="1"
                cover
                class="image-thumbnail"
              >
                <template #placeholder>
                  <div class="d-flex align-center justify-center fill-height">
                    <v-progress-circular indeterminate />
                  </div>
                </template>
              </v-img>
              <div class="image-name">{{ item.name }}</div>
            </div>
          </div>
        </v-card-text>

        <v-card-text v-else-if="!loading">
          <v-alert type="info" variant="tonal">
            {{ $t("image-picker-no-results") }}
          </v-alert>
        </v-card-text>

        <v-card-text v-else>
          <div class="d-flex align-center justify-center pa-4">
            <v-progress-circular indeterminate />
            <span class="ml-3">{{ $t("image-picker-searching") }}</span>
          </div>
        </v-card-text>
      </v-card>

      <v-card v-else-if="searchQuery && searchQuery.length < 2">
        <v-card-text>
          <v-alert type="info" variant="tonal">
            {{ $t("image-picker-type-more") }}
          </v-alert>
        </v-card-text>
      </v-card>
    </v-menu>

    <!-- Display selected images -->
    <div v-if="val && val.length > 0" class="selected-images mt-4">
      <div class="text-overline mb-2">
        <template v-if="args.key">
          {{ $t(args.key, 2) }}
        </template>
      </div>
      <div class="selected-images-grid">
        <div
          v-for="(item, index) in val"
          :key="item.slug || index"
          class="selected-image-item"
          draggable="true"
          :class="{ 'drag-over': dragOverIndex === index }"
          @dragstart="onDragStart(index, $event)"
          @dragover="onDragOver($event)"
          @drop="onDrop(index, $event)"
          @dragenter="onDragEnter(index, $event)"
          @dragleave="onDragLeave($event)"
        >
          <v-img
            :src="item.thumb || item.url"
            :alt="item.alt || item.name"
            aspect-ratio="1"
            cover
            class="selected-thumbnail"
          />
          <div class="image-overlay">
            <v-icon class="drag-handle" icon="mdi-drag-vertical" size="small" />
            <div class="image-name-overlay">{{ item.name }}</div>
          </div>
          <div class="image-actions">
            <v-tooltip :text="$t('move-left')">
              <template #activator="{ props }">
                <v-btn
                  icon="mdi-chevron-left"
                  size="x-small"
                  v-bind="props"
                  variant="tonal"
                  :disabled="index === 0"
                  @click="moveItem(index, index - 1)"
                />
              </template>
            </v-tooltip>
            <v-tooltip :text="$t('remove-item')">
              <template #activator="{ props }">
                <v-btn
                  icon="mdi-close"
                  size="x-small"
                  v-bind="props"
                  variant="tonal"
                  @click="removeItem(index)"
                />
              </template>
            </v-tooltip>
            <v-tooltip :text="$t('move-right')">
              <template #activator="{ props }">
                <v-btn
                  icon="mdi-chevron-right"
                  size="x-small"
                  v-bind="props"
                  variant="tonal"
                  :disabled="index === val.length - 1"
                  @click="moveItem(index, index + 1)"
                />
              </template>
            </v-tooltip>
          </div>
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

// Dynamically import the listFiles GraphQL query
const getGraphQLQuery = async () => {
  return (
    await import(
      "@paris-ias/trees/dist/graphql/client/files/query.list.files.gql"
    )
  ).default
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

    // Define which fields to keep for image files
    const fieldsToKeep = [
      "slug",
      "name",
      "url",
      "thumb",
      "alt",
      "caption",
      "copyright",
      "license",
      "size",
      "fileType",
    ]

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
          limit: 24,
          skip: 0,
          sortBy: ["createdAt"],
          sortDesc: [true],
          filters: JSON.stringify({ category: ["IMAGE"] }),
        },
        lang: "en",
      },
    })

    const data = result.data.listFiles
    console.log("images data: ", data)

    if (data && data.items) {
      searchResults.value = data.items
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

// Handle focus - open menu
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
.image-picker {
  margin-top: 16px;

  .image-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 8px;

    .image-grid-item {
      position: relative;
      cursor: pointer;
      border-radius: 4px;
      overflow: hidden;
      transition: transform 0.2s ease, box-shadow 0.2s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

        .image-name {
          opacity: 1;
        }
      }

      .image-thumbnail {
        border-radius: 4px;
        border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
      }

      .image-name {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 4px;
        font-size: 0.75rem;
        text-align: center;
        opacity: 0;
        transition: opacity 0.2s ease;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }

  .selected-images {
    .selected-images-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 12px;

      .selected-image-item {
        position: relative;
        border: 2px solid rgba(var(--v-border-color), var(--v-border-opacity));
        border-radius: 8px;
        overflow: hidden;
        cursor: move;
        transition: all 0.2s ease;

        &:hover {
          border-color: rgba(var(--v-theme-primary), 0.5);

          .image-overlay {
            opacity: 1;
          }

          .image-actions {
            opacity: 1;
          }
        }

        &.drag-over {
          border-color: rgba(var(--v-theme-primary), 1);
          border-width: 3px;
          background-color: rgba(var(--v-theme-primary), 0.1);
        }

        .selected-thumbnail {
          border-radius: 6px;
        }

        .image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          background: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.7) 0%,
            transparent 100%
          );
          padding: 8px;
          opacity: 0;
          transition: opacity 0.2s ease;
          display: flex;
          align-items: flex-start;
          gap: 8px;

          .drag-handle {
            flex-shrink: 0;
            cursor: grab;
            color: white;

            &:active {
              cursor: grabbing;
            }
          }

          .image-name-overlay {
            color: white;
            font-size: 0.875rem;
            font-weight: 500;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        .image-actions {
          position: absolute;
          bottom: 8px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.2s ease;
          background: rgba(255, 255, 255, 0.95);
          padding: 4px;
          border-radius: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
      }
    }
  }
}
</style>
