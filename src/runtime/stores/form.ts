import { defineStore } from "pinia"
import type { InputParams, ModuleType, searchResults } from "../types"

// Define a more flexible state interface that allows dynamic modules
interface FormStoreState {
  scrolled: boolean
  loading: boolean
  // This index signature allows for dynamic module properties
  // The type is a union of all possible value types
  [key: string]:
    | boolean
    | number
    | string
    | ModuleType
    | searchResults
    | Record<string, unknown>
}

export const useFormStore = defineStore("formStore", {
  state: (): FormStoreState => ({
    scrolled: false, // Remove process.browser check for SSR compatibility
    loading: false,
  }),

  getters: {
    isLoading: (state) => state.loading,
    isScrolled: (state) => state.scrolled,
  },

  actions: {
    /*  addModule(type: string, module: Record<string, unknown>) {
      if (!type) {
        console.warn("addModule: type or module is undefined")
        return
      }
      // Check if the module already exists
      if (this[type]) {
        console.log("this[type]: ", this[type])
        console.warn(`Module ${type} already exists, skipping addition`)
        return
      }

      try {
        this.$patch((state: FormStoreState) => {
          // Add the module to the state using the provided type as the key
          state[type] = module
        })

        // If that doesn't work (rarely happens), try direct property assignment
        if (!this[type]) {
          this.$state[type] = module
        }

        // Debug verification - check if the module was added correctly
        console.log("Verifying module addition:")
        console.log("Direct access:", this[type])
        console.log("State access:", this.$state[type])
        console.log(`Module ${type} added to the store`)
      } catch (error) {
        console.error("Error adding module to store:", error)
      }
    }, */
    save(type: string): boolean | undefined {
      try {
        // save the related form from the store to the target
        if ((this[type] as ModuleType).source === "md") {
          // @todo implement GitHub save
          console.log("Saving to GitHub...")
        }
        if ((this[type] as ModuleType).source === "gql") {
          // @todo implement GraphQL mutation
          console.log("Saving via GraphQL...")
        }
        return true
      } catch (error) {
        console.log(`error while saving ${type}`, error)
      }
    },

    setLoading(value: boolean, type: string = "") {
      this.loading = value
      if (type.length) {
        const moduleType = this[type] as ModuleType
        if (moduleType) {
          moduleType.loading = value
        }
      }
    },

    setScrolled() {
      if (import.meta.client) {
        this.scrolled = window.scrollY > 0
      }
    },
    // This is an recursive function to get a key from the store.
    // It uses an array "level" to navigate through the store's nested structure.
    // if level is 1 length, and is not an integer, we have a primitive and return it
    // if level is 1 length, and is an integer, we have an array and return it
    // if level is > 1 length, we have an object and we need to recurse into it
    // The current store context 'at the depth matching the level' is passed as 'store'
    // and the next level is passed as 'level.slice(1)'.
    getKey({ key, level, store }: InputParams): any {
      console.log("key: ", key)
      console.log("level: ", level)
      if (!level || !Array.isArray(level) || level.length === 0) {
        return undefined
      }

      const isArray = typeof level[0] === "number"
      if (level.length === 1) {
        // Guard against undefined keys
        if (store[level[0]] === undefined) store[level[0]] = ""
        return isArray ? store.at(level[0]) : store[level[0]]
      }

      if (level.length > 1) {
        // Guard against undefined keys
        if (store[level[0]] === undefined) {
          if (isArray) {
            store[level[0]] = []
          } else {
            // If the key is not a number, it is an object
            store[level[0]] = {}
          }
        }
        return this.getKey({
          key,
          level: level.slice(1),
          store: isArray ? store.at(level[0]) : store[level[0]],
        })
      }
    },

    updateForm({ key, value, category, level, store }: InputParams): any {
      if (!category || !key) return

      level = level ?? [
        (this[category as string] as ModuleType)?.form?.values[key],
      ]
      store = store ?? (this[category as string] as ModuleType).form?.values

      if (!level || !Array.isArray(level) || !store) return

      console.log(`updateForm
        key: ${key}
        value: ${value}
        category: ${category}
        level: ${level}
        store: ${
          Array.isArray(store) ? store.length : Object.keys(store).length
        }`)

      if (level.length === 1) {
        // Guard against undefined keys
        if (store[level[0]] === undefined) store[level[0]] = ""
        store[level[0]] = value
      }

      if (level.length > 1) {
        const isArray = typeof level[0] === "number"
        // Guard against undefined keys
        if (store[level[0]] === undefined) {
          if (isArray) {
            const itemValue = (this[category as string] as ModuleType).form
              ?.schema[key]?.default
            store[level[0]] = [itemValue]
          } else {
            store[level[0]] = {}
          }
        }
        return this.updateForm({
          key,
          value,
          level: level.slice(1),
          category,
          store: store[level[0]],
        })
      }
    },

    deleteFormItem({
      key,
      category,
      level = null,
      store = null,
    }: InputParams): any {
      if (!category || !key) return

      level = level ?? [
        (this[category as string] as ModuleType).form?.values[key],
      ]
      store = store ?? (this[category as string] as ModuleType).form?.values

      if (!level || !Array.isArray(level) || !store) return

      console.log(`deleteFormItem
        key: ${key}
        category: ${category}
        level: ${level}`)

      // If level = 1 this is a primitive
      if (level.length === 1 && Array.isArray(store)) {
        console.log("store length before: ", store.length)
        const newStore = store.filter(
          (item: any, index: any) => index !== level[0]
        )
        // Replace store contents
        store.splice(0, store.length, ...newStore)
        console.log("store length after: ", store.length)
      } else if (level.length > 1) {
        return this.deleteFormItem({
          key,
          level: level.slice(1),
          category,
          store: store[level[0]],
        })
      }
    },

    addFormItem({
      key,
      category,
      level = null,
      store = null,
      defaults = null,
    }: InputParams): any {
      try {
        if (!category || !key) return

        level = level ?? [
          (this[category as string] as ModuleType).form?.values[key],
        ]
        store = store ?? (this[category as string] as ModuleType).form?.values
        const defaultForm = (this[category as string] as ModuleType).form
          ?._defaults as string

        if (!defaults && defaultForm) {
          defaults = JSON.parse(defaultForm)
        }

        if (!level || !Array.isArray(level) || !store) return

        // If level = 1 this is a primitive
        if (level.length === 1) {
          const defaultValue = defaults?.[level[0]]?.[0]
          if (Array.isArray(store[key])) {
            store[key].push(defaultValue)
          }
        } else if (level.length > 1) {
          const isArray = typeof level[0] === "number"
          // Guard against undefined keys
          if (store[level[0]] === undefined) {
            if (isArray) {
              store[level[0]] = []
            } else {
              store[level[0]] = {}
            }
          }
          return this.addFormItem({
            key,
            level: level.slice(1),
            category,
            store: store[level[0]],
            defaults: defaults?.[level[0]],
          })
        }
      } catch (error) {
        console.log("error: ", error)
      }
    },
  },
})
