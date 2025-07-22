import type { AppConfig } from "nuxt/schema"
import { defineNuxtPlugin, useAppConfig } from "#app"
import { useFormStore } from "../stores/form"

export default defineNuxtPlugin(async (nuxtApp) => {
  console.log("Pinia plugin for form module initialized")
  const appConfig = useAppConfig() as AppConfig & {
    form: {
      modules: string[]
    }
  }

  // Define module imports
  const moduleImports = {
    events: () => ({
      model: import("@paris-ias/data/dist/form/events.js"),
    }),
    news: () => ({
      model: import("@paris-ias/data/dist/form/news.js"),
    }),
    people: () => ({
      model: import("@paris-ias/data/dist/form/people.js"),
    }),
    projects: () => ({
      model: import("@paris-ias/data/dist/form/projects.js"),
    }),
    fellowships: () => ({
      model: import("@paris-ias/data/dist/form/fellowships.js"),
    }),
    publications: () => ({
      model: import("@paris-ias/data/dist/form/publications.js"),
    }),

    actions: () => ({
      model: import("@paris-ias/data/dist/form/action.js"),
    }),

    affiliations: () => ({
      model: import("@paris-ias/data/dist/form/affiliations.js"),
    }),
    disciplines: () => ({
      model: import("@paris-ias/data/dist/form/disciplines.js"),
    }),
    files: () => ({
      model: import("@paris-ias/data/dist/form/files.js"),
    }),

    mailing: () => ({
      model: import("@paris-ias/data/dist/form/mailing.js"),
    }),

    tags: () => ({
      model: import("@paris-ias/data/dist/form/tags.js"),
    }),

    apps: () => ({
      model: import("@paris-ias/data/dist/form/apps.js"),
    }),

    users: () => ({
      model: import("@paris-ias/data/dist/form/users.js"),
    }),

    // Add other modules similarly...
  }

  // Initialize empty stores object
  const schemas: Record<string, any> = {}
  const forms: Record<string, any> = {}
  console.log("INITIALIZING STORES", appConfig.form.modules)
  // Preload all required modules
  const formStore = useFormStore()
  await Promise.all(
    appConfig.form.modules.map(async (type) => {
      try {
        const imports = await moduleImports[
          type as keyof typeof moduleImports
        ]()
        const model = (await imports.model).default

        // Check if the model has the expected structure
        if (model && model._defaults && model.schema) {
          forms[type] = model._defaults
          schemas[type] = model.schema
        } else {
          console.warn(
            `Module ${type} does not have expected structure:`,
            model
          )
        }
      } catch (error) {
        console.error(`Failed to initialize ${type} store:`, error)
      }
    })
  )

  // Initialize the form modules in the store
  console.log("Loading modules into formStore:", Object.keys(forms))

  // Add each module to the form store
  Object.keys(forms).forEach((type) => {
    console.log(`Adding ${type} to form store`)
    formStore.$patch({ [type]: forms[type] })
  })

  // Provide synchronous access to stores and queries
  nuxtApp.provide("forms", forms)
  nuxtApp.provide("schemas", schemas)
  nuxtApp.provide("formStore", formStore)
})
