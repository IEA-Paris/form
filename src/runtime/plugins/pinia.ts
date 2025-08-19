import type { AppConfig } from "nuxt/schema"
import { defineNuxtPlugin, useAppConfig } from "#app"
import { useFormStore } from "../stores/form"

const buildInitialValues = (
  schema: Record<string, any>
): Record<string, any> => {
  const result: Record<string, any> = {}
  for (const [key, field] of Object.entries(schema || {})) {
    switch (field.type) {
      case "PRIMITIVE": {
        if ("default" in field) result[key] = field.default
        else if (field.component === "Checkbox") result[key] = false
        else result[key] = ""
        break
      }
      case "DOCUMENT": {
        result[key] = "default" in field ? field.default : ""
        break
      }
      case "OBJECT": {
        result[key] = buildInitialValues(field.items || {})
        break
      }
      case "ARRAY": {
        result[key] = []
        break
      }
      default: {
        result[key] = null
      }
    }
  }
  return result
}

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
  } as const

  const schemas: Record<string, any> = {}
  const forms: Record<string, any> = {}

  const formStore = useFormStore()

  await Promise.all(
    appConfig.form.modules.map(async (type) => {
      try {
        const imports = await moduleImports[
          type as keyof typeof moduleImports
        ]()
        const model = (await imports.model).default

        if (model && model.schema) {
          const values = buildInitialValues(model.schema)
          schemas[type] = model.schema
          forms[type] = values

          formStore.$patch({
            [type]: {
              source: "model",
              loading: false,
              form: {
                values,
                schema: model.schema,
                _defaults: JSON.stringify(values),
              },
            },
          })
        } else {
          console.warn(`Module ${type} has no 'schema'`, model)
        }
      } catch (error) {
        console.error(`Failed to initialize ${type} store:`, error)
      }
    })
  )

  nuxtApp.provide("forms", forms)
  nuxtApp.provide("schemas", schemas)
  nuxtApp.provide("formStore", formStore)
})
