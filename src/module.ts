import {
  defineNuxtModule,
  addPlugin,
  createResolver,
  addComponentsDir,
  addImportsDir,
  installModule,
} from "@nuxt/kit"

// Module options TypeScript interface definition
export interface ModuleOptions {
  /**
   * Enable GraphQL mutations
   * @default true
   */
  enableGraphQL?: boolean
  /**
   * Enable Pinia store
   * @default true
   */
  enableStore?: boolean
  /**
   * Component prefix
   * @default 'Form'
   */
  componentPrefix?: string
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
  defaults: {
    enableGraphQL: true,
    enableStore: true,
    componentPrefix: "Form",
  },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addPlugin(resolver.resolve("./runtime/plugin"))

    // Auto-import components with prefix
    await addComponentsDir({
      path: resolver.resolve("./runtime/components"),
      prefix: options.componentPrefix,
      global: true,
    })

    // Auto-import composables
    addImportsDir(resolver.resolve("./runtime/composables"))

    // Install Pinia if store is enabled
    if (options.enableStore) {
      await installModule("@pinia/nuxt")

      // Add store to imports
      nuxt.hook("nitro:config", async (nitroConfig) => {
        nitroConfig.alias = nitroConfig.alias || {}
        nitroConfig.alias["#form-store"] = resolver.resolve("./runtime/stores")
      })
    }

    // Add GraphQL support if enabled
    if (options.enableGraphQL) {
      // Register GraphQL files directory
      nuxt.hook("nitro:config", async (nitroConfig) => {
        nitroConfig.alias = nitroConfig.alias || {}
        nitroConfig.alias["#form-graphql"] =
          resolver.resolve("./runtime/graphql")
      })
    }

    // Add runtime directory to transpile
    nuxt.options.build = nuxt.options.build || {}
    nuxt.options.build.transpile = nuxt.options.build.transpile || []
    nuxt.options.build.transpile.push(resolver.resolve("./runtime"))
  },
})
