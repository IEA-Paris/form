import staticConfiguration from "./static.config"

export default defineAppConfig({
  ...staticConfiguration,
  author: "Antoine Cordelois",
  url: "https://paris-iea.fr",
  lang: {
    locales: ["en", "fr"],
    default: "en",
  },
  list: {
    modules: ["events", "news", "people", "projects", "fellowships"],
  },
  form: {
    modules: [
      "events",
      "news",
      "people",
      "projects",
      "fellowships",
      "publications",
      "actions",
      "disciplines",
      "apps",
      "affiliations",
      "files",
      "mailing",
      "tags",
      "users",
    ],
  },
})
