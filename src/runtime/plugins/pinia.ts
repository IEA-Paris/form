import type { AppConfig } from "nuxt/schema"
import { defineNuxtPlugin, useAppConfig } from "#app"
import { useFormStore } from "../stores/form"

export default defineNuxtPlugin(async (nuxtApp) => {
  const appConfig = useAppConfig() as AppConfig & {
    form: { modules: string[] }
  }

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

    affiliation: () => ({
      model: import("@paris-ias/data/dist/form/affiliation.js"),
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
  } as const

  const schemas: Record<string, any> = {}
  const forms: Record<string, any> = {}
  const defaults: Record<string, any> = {}

  const formStore = useFormStore()
  const options = {}
  await Promise.all(
    appConfig.form.modules.map(async (type) => {
      try {
        const imports = moduleImports[type as keyof typeof moduleImports]()
        const model = (await imports.model).default

        if (model && model.schema) {
          schemas[type] = model.schema
          forms[type] = model._defaults
          options[type] = []
          formStore.$patch({
            [type]: structuredClone(model._defaults),
          })
        } else {
          console.warn(`Module ${type} has no 'schema'`, model)
        }
      } catch (error) {
        console.error(`Failed to initialize ${type} store:`, error)
      }
    })
  )
  // add the form options objects to the store
  formStore.$patch({
    options: options,
  })
  nuxtApp.provide("forms", forms)
  nuxtApp.provide("schemas", schemas)
  nuxtApp.provide("formStore", formStore)
})
