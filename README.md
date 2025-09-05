# Apex Nuxt Form Module

A comprehensive Nuxt 3 module that provides form components, composables, stores, and GraphQL mutations for building dynamic forms with Vuetify.

## Features

- 🎨 **Vuetify Components**: Pre-built form components using Vuetify design system
- 🔄 **Reactive Forms**: Pinia-based form state management
- 🧩 **Dynamic Forms**: Support for nested objects and arrays
- 📝 **Validation**: Built-in validation rules
- 🚀 **TypeScript**: Full TypeScript support
- 📊 **GraphQL**: Ready-to-use GraphQL mutations
- 🎯 **Composables**: Utility functions for form handling

## Installation

```bash
npm install @apex/nuxt-form-module
```

## Setup

Add the module to your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: [
    '@apex/nuxt-form-module'
  ],
  formModule: {
    // Configuration options
    enableGraphQL: true,
    enableStore: true,
    componentPrefix: 'Form'
  }
})
```

Make sure you have the required peer dependencies:

```bash
npm install vuetify @pinia/nuxt
```

## Components

### Atomic Components

- `FormTextField` - Text input field
- `FormTextArea` - Multi-line text input
- `FormSelect` - Dropdown selection
- `FormAutoComplete` - Autocomplete field
- `FormCheckbox` - Checkbox input
- `FormBooleanSwitch` - Toggle switch
- `FormFileInput` - File upload input

### Organism Components

- `FormForm` - Complete form wrapper
- `FormRecursiveFormblock` - Recursive form field renderer

## Usage

### Basic Form

```vue
<template>
  <FormForm 
    category="myForm" 
    @save="handleSave"
    @validate="handleValidate"
  />
</template>

<script setup>
const handleSave = (result) => {
  console.log('Form saved:', result)
}

const handleValidate = (validation) => {
  console.log('Form validation:', validation)
}
</script>
```

### Individual Components

```vue
<template>
  <div>
    <FormTextField
      :args="{
        key: 'name',
        label: 'Full Name',
        required: true,
        placeholder: 'Enter your name'
      }"
      :level="['name']"
      category="user"
    />
    
    <FormSelect
      :args="{
        key: 'country',
        label: 'Country',
        items: countries,
        required: true
      }"
      :level="['country']"
      category="user"
    />
  </div>
</template>
```

## Store Usage

The module provides a form store that you can use in your components:

```typescript
// composables/useMyForm.ts
export const useMyForm = () => {
  const formStore = useFormStore()
  
  // Initialize form
  const initForm = (schema: any, values: any = {}) => {
    formStore.initializeForm('myForm', schema, values)
  }
  
  // Get form values
  const getValues = () => {
    return formStore.myForm?.form?.values || {}
  }
  
  // Save form
  const save = async () => {
    return await formStore.save('myForm')
  }
  
  return {
    initForm,
    getValues,
    save
  }
}
```

## Composables

### useFormValidation

```typescript
const { validateField, validateForm } = useFormValidation()

// Validate individual field
const isValid = validateField(value, rules)

// Validate entire form
const formValidation = validateForm(formData, schema)
```

## Configuration

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  formModule: {
    // Enable/disable GraphQL mutations
    enableGraphQL: true,
    
    // Enable/disable Pinia store
    enableStore: true,
    
    // Customize component prefix
    componentPrefix: 'Form', // Components will be named FormTextField, FormSelect, etc.
  }
})
```

## GraphQL Integration

The module includes GraphQL mutations for form operations. Example usage:

```typescript
// In your component
import eventsMutation from '#form-graphql/mutations/events.gql'

const { mutate } = useMutation(eventsMutation)

const bookEvent = async (itemId: string, slot: any) => {
  const result = await mutate({
    itemId,
    slot
  })
  return result
}
```

## TypeScript Support

The module provides full TypeScript support with proper type definitions:

```typescript
interface FormArgs {
  key: string
  label?: string
  required?: boolean
  placeholder?: string
  hint?: string
  disabled?: boolean
  readonly?: boolean
  rules?: Array<(value: any) => boolean | string>
}

interface FormProps {
  args: FormArgs
  level: Array<string | number>
  category: string
}
```

## Development

To contribute to this module:

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development: `npm run dev:prepare && npm run dev`
4. Build: `npm run prepack`

## License

MIT License - see LICENSE file for details.


## personal notes/ way forward/plan

- rework default values
- Fix the ObjectKeypariContainer validation
- Fix object in array (e.g. people videos)
- disable tooltip when collectionContainer addBtn is enabled
- Add a proper AGPL licences to packages
- implement group control in form display (could match with a dedicated admin export)

...
- BAck office navigation
- Add github auth provider similar to sleipnir