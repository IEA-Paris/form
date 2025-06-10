<template>
  <div>
    <h1>Form Module Playground</h1>
    <FormTextField
      :args="{
        key: 'name',
        label: 'Full Name',
        required: true,
        placeholder: 'Enter your name',
      }"
      :level="['name']"
      category="test"
    />
  </div>
</template>
