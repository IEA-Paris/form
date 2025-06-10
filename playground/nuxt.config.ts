export default defineNuxtConfig({
  modules: ["../src/module"],
  formModule: {
    enableGraphQL: true,
    enableStore: true,
    componentPrefix: "Form",
  },
  devtools: { enabled: true },
})
