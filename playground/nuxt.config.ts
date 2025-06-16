import config from "./static.config"
export default defineNuxtConfig({
  modules: ["../src/module"],
  ssr: true,
  form: {
    modules: [
      "events",
      "news",
      "people",
      "projects",
      "fellowships",
      "publications",
      "actions",
      "affiliations",
      "disciplines",
      "files",
      "mailing",
      "tags",
      "apps",
      "users",
    ],
  },
  modules: [
    "@nuxt/eslint",
    "@nuxt/image",
    "@nuxtjs/i18n",
    "@nuxtjs/apollo",
    "@pinia/nuxt",
    "@nuxtjs/mdc",
  ],
  build: {
    transpile: ["vuetify", "@paris-ias/list"],
  },
  pinia: {
    autoImports: ["defineStore", ["defineStore", "definePiniaStore"]],
  },
  devtools: { enabled: true },
  compatibilityDate: "2025-04-08",
  apollo: {
    // https://apollo.nuxtjs.org/getting-started/configuration
    clients: {
      default: {
        httpEndpoint: config.graphqlEndpoint,
        httpLinkOptions: {
          headers: {
            "x-api-key": config.graphqlApiKey,
          },
        },
        inMemoryCacheOptions: {
          addTypename: false,
        },
      },
    },
  },
})
