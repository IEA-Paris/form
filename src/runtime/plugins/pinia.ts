import type { AppConfig } from "nuxt/schema"
import { defineNuxtPlugin, useAppConfig } from "#app"
import { useFormStore } from "../stores/form"

export default defineNuxtPlugin(async (nuxtApp) => {
  const appConfig = useAppConfig() as AppConfig & {
    form: { modules: string[] }
  }

  const moduleImports = {
    events: () => ({
      model: import("@paris-ias/trees/form/events"),
    }),
    news: () => ({
      model: import("@paris-ias/trees/form/news"),
    }),
    people: () => ({
      model: import("@paris-ias/trees/form/people"),
    }),
    projects: () => ({
      model: import("@paris-ias/trees/form/projects"),
    }),
    fellowships: () => ({
      model: import("@paris-ias/trees/form/fellowships"),
    }),
    publications: () => ({
      model: import("@paris-ias/trees/form/publications"),
    }),

    actions: () => ({
      model: import("@paris-ias/trees/form/actions"),
    }),

    affiliations: () => ({
      model: import("@paris-ias/trees/form/affiliations"),
    }),
    disciplines: () => ({
      model: import("@paris-ias/trees/form/disciplines"),
    }),
    files: () => ({
      model: import("@paris-ias/trees/form/files"),
    }),

    mailing: () => ({
      model: import("@paris-ias/trees/form/mailing"),
    }),

    tags: () => ({
      model: import("@paris-ias/trees/form/tags"),
    }),

    apps: () => ({
      model: import("@paris-ias/trees/form/apps"),
    }),

    users: () => ({
      model: import("@paris-ias/trees/form/users"),
    }),
  } as const

  const schemas: Record<string, any> = {}
  const forms: Record<string, any> = {}

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
          options[type] = {
            local: [],
            orcid: [],
            wikipedia: [],
            hal: [],
          }
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
