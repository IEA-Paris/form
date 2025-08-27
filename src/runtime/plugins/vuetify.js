import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import * as labsComponents from 'vuetify/labs/components'
import { defineNuxtPlugin } from "nuxt/app";
export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    ssr: true,
    components,
    labsComponents,
    directives,
    mobileBreakpoint: "sm",
    /*  thresholds: {
      xs: 0,
      sm: 340,
      md: 540,
      lg: 800,
      xl: 1280,
    }, */
  });

  nuxtApp.vueApp.use(vuetify);
});
