import type { AppConfig } from "nuxt/schema"
import { createDynamicStore } from "../stores/factory"
import { useFormStore } from "../stores/form"
import { defineNuxtPlugin, useAppConfig } from "#app"
export default defineNuxtPlugin(async (nuxtApp) => {
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
  const forms = {}
  const schemas = {}
  console.log("INITIALIZING STORES")
  // Preload all required modules
  await Promise.all(
    appConfig.form.modules.map(async (type) => {
      try {
        const imports = await moduleImports[
          type as keyof typeof moduleImports
        ]()
        const model = (await imports.model).default

        forms[type] = model.form._defaults

        schemas[type] = model.form.schema
      } catch (error) {
        console.error(`Failed to initialize ${type} store:`, error)
      }
    })
  )
  const FormStore = useFormStore()
  // Provide synchronous access to stores and queries
  nuxtApp.provide("FormStore", FormStore)
  nuxtApp.provide("schemas", schemas.form.schema)
})
