# Using the Apex Form Module in Your Nuxt Project

## Quick Start

### 1. Installation in Apex Frontend

The form module is already integrated into the Apex frontend. It's located in `/apex/frontend/form/` and configured as a local module.

### 2. Basic Usage

```vue
<template>
  <div>
    <!-- Simple text field -->
    <FormTextField
      :args="{
        key: 'name',
        label: 'Full Name',
        required: true,
        placeholder: 'Enter your name'
      }"
      :level="['name']"
      category="myForm"
    />
    
    <!-- Complete form with auto-rendering -->
    <FormForm 
      category="myForm" 
      @save="handleSave"
    />
  </div>
</template>

<script setup>
// Initialize the form when component mounts
const formStore = useFormStore()

onMounted(() => {
  // Define form schema
  const schema = {
    name: { type: 'TextField', label: 'Name', required: true },
    email: { type: 'TextField', label: 'Email', required: true },
    bio: { type: 'TextArea', label: 'Bio' }
  }
  
  // Initialize with default values
  formStore.initializeForm('myForm', schema, {
    name: '',
    email: '',
    bio: ''
  })
})

const handleSave = (result) => {
  console.log('Form saved:', result)
}
</script>
```

## Available Components

### Atomic Components
- **FormTextField** - Single line text input
- **FormTextArea** - Multi-line text input  
- **FormSelect** - Dropdown selection
- **FormAutoComplete** - Searchable dropdown with auto-completion
- **FormCheckbox** - Boolean checkbox
- **FormBooleanSwitch** - Toggle switch
- **FormFileInput** - File upload

### Organism Components
- **FormForm** - Complete form wrapper with validation and save functionality
- **FormRecursiveFormblock** - Renders nested form structures

## Form Store API

### Methods

```typescript
// Initialize a form
formStore.initializeForm(category: string, schema: object, initialValues: object)

// Save form data
formStore.save(category: string)

// Update form field
formStore.updateForm({ key, value, category, level })

// Add item to array field
formStore.addFormItem({ key, category, level })

// Delete item from array field  
formStore.deleteFormItem({ key, category, level })

// Get nested field value
formStore.getKey({ key, level, store })
```

### Getters

```typescript
formStore.isLoading  // Boolean - form save state
formStore.isScrolled // Boolean - scroll position
```

## Component Props

### Common Props for All Form Components

```typescript
interface FormComponentProps {
  args: {
    key: string           // Field identifier
    label?: string        // Display label
    required?: boolean    // Validation requirement
    placeholder?: string  // Input placeholder
    hint?: string        // Help text
    disabled?: boolean   // Disable input
    readonly?: boolean   // Read-only mode
  }
  level: (string | number)[]  // Path to field in form data
  category: string            // Form category/namespace
}
```

### Component-Specific Args

#### FormTextField
```typescript
args: {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  minLength?: number
  maxLength?: number  
  pattern?: string
  patternMessage?: string
  clearable?: boolean
  counter?: boolean
}
```

#### FormSelect & FormAutoComplete
```typescript
args: {
  items: Array<{title: string, value: any}>
  multiple?: boolean
  chips?: boolean
  itemTitle?: string
  itemValue?: string
  returnObject?: boolean
}
```

#### FormFileInput
```typescript
args: {
  accept?: string
  multiple?: boolean
  showSize?: boolean
  maxSize?: number
  counter?: boolean
}
```

## Advanced Usage

### Nested Objects

```vue
<template>
  <FormTextField
    :args="{ key: 'firstName', label: 'First Name' }"
    :level="['user', 'profile', 'firstName']"
    category="registration"
  />
</template>
```

### Array Fields

```vue
<template>
  <!-- This will render inputs for each skill -->
  <FormRecursiveFormblock
    :input="{
      key: 'skills',
      type: 'CollectionContainerPanel',
      items: [
        { key: 'name', type: 'TextField', label: 'Skill Name' },
        { key: 'level', type: 'Select', label: 'Level', items: skillLevels }
      ]
    }"
    :level="['skills']"
    category="profile"
  />
</template>
```

### Dynamic Forms

```typescript
// Create dynamic form based on API response
const createDynamicForm = (apiSchema) => {
  const schema = {}
  const initialValues = {}
  
  apiSchema.fields.forEach(field => {
    schema[field.name] = {
      type: field.type,
      label: field.label,
      required: field.required,
      ...field.properties
    }
    initialValues[field.name] = field.default
  })
  
  formStore.initializeForm('dynamic', schema, initialValues)
}
```

### Custom Validation

```vue
<FormTextField
  :args="{
    key: 'email',
    label: 'Email',
    required: true,
    pattern: '^[^@]+@[^@]+\.[^@]+$',
    patternMessage: 'Please enter a valid email address'
  }"
  :level="['email']"
  category="user"
/>
```

## Integration with GraphQL

The module includes GraphQL mutations that can be used with Apollo:

```typescript
// Example usage in a component
import eventsMutation from '#form-graphql/mutations/events.gql'

const { mutate } = useMutation(eventsMutation)

const saveEvent = async (formData) => {
  const result = await mutate({
    itemId: formData.id,
    slot: formData.timeSlot
  })
  return result
}
```

## Module Configuration

In `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: [
    './form/src/module'
  ],
  formModule: {
    enableGraphQL: true,      // Enable GraphQL mutations
    enableStore: true,        // Enable Pinia store
    componentPrefix: 'Form'   // Component name prefix
  }
})
```

## Best Practices

1. **Form Categories**: Use descriptive category names to organize different forms
2. **Level Arrays**: Use consistent level structures for nested data
3. **Validation**: Implement validation at the component level using `args`
4. **State Management**: Use the form store for complex forms, local state for simple ones
5. **Error Handling**: Always handle save/validation errors gracefully

## Troubleshooting

### Common Issues

1. **Component not found**: Make sure the module is properly registered in `nuxt.config.ts`
2. **Store not available**: Ensure `@pinia/nuxt` is installed and configured
3. **TypeScript errors**: Check that types are properly imported from the module
4. **Vuetify styling**: Confirm Vuetify is properly configured in your project

### Debug Mode

Enable console logging to debug form operations:

```typescript
// In your component
watch(() => formStore[category]?.form?.values, (newVal) => {
  console.log('Form values changed:', newVal)
}, { deep: true })
```
