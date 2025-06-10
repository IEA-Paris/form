import { defineStore } from "pinia"
import type { InputParams, ModuleType, searchResults } from "../types"

export const useFormStore = defineStore("formStore", {
  state: (): Record<
    string,
    boolean | number | string | ModuleType | searchResults
  > => ({
    scrolled: false, // Remove process.browser check for SSR compatibility
    loading: false,
  }),

  getters: {
    isLoading: (state) => state.loading,
    isScrolled: (state) => state.scrolled,
  },

  actions: {
    // Initialize a form with schema and initial values
    initializeForm(category: string, schema: any, initialValues: any = {}) {
      this[category] = {
        form: {
          schema,
          values: { ...initialValues },
          _defaults: JSON.stringify(initialValues),
        },
        source: "local",
        loading: false,
      }
    },

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

    getKey({ key, level, store }: InputParams): any {
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
