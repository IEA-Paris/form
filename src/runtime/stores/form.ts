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
        const mod = this[type] as ModuleType
        if (mod?.source === "md") {
          console.log("Saving to GitHub...")
        }
        if (mod?.source === "gql") {
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
        if (moduleType) moduleType.loading = value
      }
    },

    setScrolled() {
      if (import.meta.client) this.scrolled = window.scrollY > 0
    },
    // This is an recursive function to get a key from the store.
    // It uses an array "level" to navigate through the store's nested structure.
    // if level is 1 length, and is not an integer, we have a primitive and return it
    // if level is 1 length, and is an integer, we have an array and return it
    // if level is > 1 length, we have an object and we need to recurse into it
    // The current store context 'at the depth matching the level' is passed as 'store'
    // and the next level is passed as 'level.slice(1)'.

    getKey({ level, store }: InputParams): any {
      if (!level || !Array.isArray(level) || level.length === 0 || !store)
        return undefined

      const currentKey = level[0]
      const isArrayIndex = typeof currentKey === "number"

      if (level.length === 1) {
        if (store[currentKey] === undefined) return undefined
        return isArrayIndex ? store.at(currentKey) : store[currentKey]
      }

      if (store[currentKey] === undefined) return undefined

      return this.getKey({
        level: level.slice(1),
        store: isArrayIndex ? store.at(currentKey) : store[currentKey],
      })
    },
    updateForm({ key, value, category, level, store }: InputParams): any {
      if (!category || !key) return

      const module = this[category as string] as ModuleType
      level = level ?? [module?.form?._defaults?.[key]]
      store = store ?? module?.form?._defaults

      if (!level || !Array.isArray(level) || !store) return

      if (level.length === 1) {
        if (store[level[0]] === undefined) store[level[0]] = ""
        store[level[0]] = value
        return
      }

      const isArrayIndex = typeof level[0] === "number"
      if (store[level[0]] === undefined) {
        store[level[0]] = isArrayIndex ? [] : {}
      }

      return this.updateForm({
        key,
        value,
        level: level.slice(1),
        category,
        store: store[level[0]],
      })
    },

    deleteFormItem({
      key,
      category,
      level = null,
      store = null,
    }: InputParams): any {
      if (!category || !key) return

      const module = this[category as string] as ModuleType
      level = level ?? [module?.form?._defaults?.[key]]
      store = store ?? module?.form?._defaults

      if (!level || !Array.isArray(level) || !store) return

      if (level.length === 1 && Array.isArray(store)) {
        const index = level[0] as number
        const newStore = store.filter((_: any, i: number) => i !== index)
        store.splice(0, store.length, ...newStore)
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

        const module = this[category as string] as ModuleType
        store = store ?? module?.form?._defaults
        level = level ?? [key]

        if (!level || !Array.isArray(level) || !store) return

        // Arriver jusqu'au conteneur qui possède le tableau cible (dernier segment de level)
        if (level.length === 1) {
          const targetKey = level[0] as string
          if (!Array.isArray(store[targetKey])) store[targetKey] = []

          const clone = (obj: any) =>
            typeof structuredClone === "function"
              ? structuredClone(obj)
              : JSON.parse(JSON.stringify(obj))

          const newItem = defaults ? clone(defaults) : {}
          ;(store[targetKey] as any[]).push(newItem)
          return
        }

        const head = level[0]
        const isArrayIndex = typeof head === "number"

        if (store[head] === undefined) {
          store[head] = isArrayIndex ? [] : {}
        }

        return this.addFormItem({
          key,
          category,
          level: level.slice(1),
          store: store[head],
          defaults,
        })
      } catch (error) {
        console.log("error: ", error)
      }
    },
    getSuggestedPicks(category: string, type: string) {
      const module = this[category] as ModuleType
      if (!module?.form?.schema) return []
      const schema = module.form.schema[type]
      if (!schema?.suggestedPicks) return []
      return schema.suggestedPicks.map((pick: any) => ({
        label: pick.label,
        value: pick.value,
      }))
    },
  },
})
