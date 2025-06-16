import {
  defineNuxtModule,
  addPlugin,
  createResolver,
  addComponentsDir,
  addImportsDir,
} from "@nuxt/kit"

// Module options TypeScript interface definition
interface ModuleOptions {
  [key: string]: unknown
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "@paris-ias/form",
    configKey: "form",
    compatibility: {
      nuxt: "^3.0.0",
    },
  },
  // Default configuration options of the Nuxt module
  defaults: {},
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addPlugin(resolver.resolve("./runtime/plugins/pinia"))
    addPlugin(resolver.resolve("./runtime/plugins/vuetify"))
    // Add components
    addComponentsDir({
      path: resolver.resolve("./runtime/components"),
      global: true,
    })

    // Auto-import composables
    addImportsDir(resolver.resolve("./runtime/composables"))
    // Add graphQL queries
    addImportsDir(resolver.resolve("./runtime/graphql"))

    // Serve the public directory
    nuxt.hook("nitro:config", async (nitroConfig) => {
      nitroConfig.publicAssets ||= []
      nitroConfig.publicAssets.push({
        dir: resolver.resolve("./runtime/public"),
        maxAge: 60 * 60 * 24 * 365, // 1 year
      })
    })
    // Add translations

    nuxt.hook("i18n:registerModule", (register) => {
      register({
        // langDir path needs to be resolved
        langDir: resolver.resolve("./runtime/translations"),
        locales: [
          {
            code: "en",
            file: "en.json",
          },
          {
            code: "fr",
            file: "fr.json",
          },
        ],
      })
    })

    // Add form configuration to app config
    nuxt.options.appConfig = nuxt.options.appConfig || {}
    nuxt.options.appConfig.form = {
      modules: nuxt.options.form?.modules || [],
      ...options,
    }

    // Add i18n configuration
    nuxt.options.i18n = {
      ...nuxt.options.i18n,
      langDir: resolver.resolve("./runtime/translations"),
    }

    // Add store to imports
    nuxt.hook("nitro:config", async (nitroConfig) => {
      nitroConfig.alias = nitroConfig.alias || {}
      nitroConfig.alias["#form-store"] = resolver.resolve("./runtime/stores")
    })
    nuxt.options.apollo = {
      ...nuxt.options.apollo,
    }
    // Register GraphQL files directory
    nuxt.hook("nitro:config", async (nitroConfig) => {
      nitroConfig.alias = nitroConfig.alias || {}
      nitroConfig.alias["#form-graphql"] = resolver.resolve("./runtime/graphql")
    })
    // Add Vuetify configuration
    nuxt.options.build.transpile = [
      ...(nuxt.options.build.transpile || []),
      "vuetify",
    ]
    // Add runtime directory to transpile
    nuxt.options.build = nuxt.options.build || {}
    nuxt.options.build.transpile = nuxt.options.build.transpile || []
    nuxt.options.build.transpile.push(resolver.resolve("./runtime"))
  },
})
