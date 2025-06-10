export interface InputParams {
  key?: any | string
  level?: string[] | number[] | number | any
  store?: any
  category?: string
  defaults?: any | null
  value?: any
}

export interface ModuleType {
  source?: string
  loading?: boolean
  form?: {
    values: Record<string, any>
    schema: Record<string, any>
    _defaults?: string
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
