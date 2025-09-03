export interface InputParams {
  key?: any | string
  level?: string[] | number[] | number | any
  store?: any
  category?: string
  defaults?: any | null
  value?: any
  newItem?: any | null
}

export interface ModuleType {
  source?: string
  loading?: boolean
  form?: {
    [key: string]: any
  }
}

export interface searchResults {
  // Define search results interface as needed
  [key: string]: any
}

export interface FormValidationRule {
  (value: any): boolean | string
}

export interface FormFieldSchema {
  type: string
  label?: string
  required?: boolean
  default?: any
  validation?: FormValidationRule[]
  options?: any[]
}
