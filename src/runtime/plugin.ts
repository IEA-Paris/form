import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(() => {
  // Plugin initialization logic
  console.log('Form module plugin loaded')
  
  // You can add global properties, register components, etc.
  return {
    provide: {
      formModule: {
        version: '1.0.0'
      }
    }
  }
})
