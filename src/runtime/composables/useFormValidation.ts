import type { FormValidationRule } from '../types'

// Built-in regex patterns
const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const alphaRegex = /^[a-zA-Z\s]*$/
const youtubeRegex = /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/
const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
const rorRegex = /^https:\/\/ror\.org\/[0-9a-z]+$/
const doiRegex = /^10\.\d{4,}\/[-._;()\/:a-zA-Z0-9]+$/
const dateRegex = /^\d{4}-\d{2}-\d{2}$/
const orcidRegex = /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/

export const useFormValidation = () => {
  const { $i18n } = useNuxtApp()
  const t = $i18n?.t || ((key: string, params?: any[]) => key)

  const requiredRules = (value: any): boolean => {
    return (
      value !== undefined &&
      value !== null &&
      value !== false &&
      (Array.isArray(value) || typeof value === "string"
        ? value.length > 0
        : true)
    )
  }

  const alphaRules = (value: string): boolean => !value || alphaRegex.test(value)
  
  const minRules = (min: number) => (value: string): boolean => {
    return !value || value.length >= min
  }
  
  const maxRules = (max: number) => (value: string): boolean => 
    !value || value.length <= max

  const urlRules = (value: string): boolean =>
    !value || (value.length > 0 && urlRegex.test(value))

  const emailRules = (value: string): boolean =>
    !value || (value.length > 0 && emailRegex.test(value))

  const ytRules = (value: string): boolean =>
    !value || (value.length > 0 && youtubeRegex.test(value))

  const colorRules = (value: string): boolean =>
    !value || colorRegex.test(value)

  const rorRules = (value: string): boolean =>
    !value || rorRegex.test(value)

  const doiRules = (value: string): boolean =>
    !value || doiRegex.test(value)

  const dateRules = (value: string): boolean =>
    !value || dateRegex.test(value)

  const orcidRules = (value: string): boolean =>
    !value || orcidRegex.test(value)

  const digitRules = (value: any): boolean =>
    typeof value === "number" || !isNaN(Number(value))

  const computeInputVisibility = (visibilityRules: any, form: any): boolean => {
    if (!visibilityRules?.default) return true
    let result = !!visibilityRules.default
    
    if (visibilityRules?.switchIf?.length > 0) {
      visibilityRules?.switchIf?.forEach((rule: any) => {
        // TODO: implement complex visibility rules
        result = rule
      })
    }
    
    return result
  }

  const generateInputRules = (input: any): FormValidationRule[] => {
    if (!input?.rules) return []
    const rules: FormValidationRule[] = []
    
    if (Object.keys(input?.rules)?.length > 0) {
      Object.keys(input?.rules).forEach((rule) => {
        switch (rule) {
          case "required":
            rules.push((value) => {
              return requiredRules(value) || t("rules.required")
            })
            break
          case "min":
            rules.push((value) => {
              return (
                !!minRules(input.rules[rule])(value) ||
                t("rules.at-least-0-characters", [input.rules[rule]])
              )
            })
            break
          case "max":
            rules.push((value) => {
              return (
                !!maxRules(input.rules[rule])(value) ||
                t("rules.max-0-characters", [input.rules[rule]])
              )
            })
            break
          case "email":
            rules.push((value) => {
              return !!emailRules(value) || t("rules.invalid-e-mail")
            })
            break
          case "url":
            rules.push((value) => {
              return !!urlRules(value) || t("rules.invalid-url")
            })
            break
          case "alpha":
            rules.push((value) => {
              return (
                !!alphaRules(value) ||
                t("rules.numbers-and-special-characters-not-allowed")
              )
            })
            break
          case "yt":
            rules.push((value) => {
              return !!ytRules(value) || t("rules.invalid-youtube-url")
            })
            break
          case "color":
            rules.push((value) => {
              return !!colorRules(value) || t("rules.invalid-color-code")
            })
            break
          case "ror":
            rules.push((value) => {
              return !!rorRules(value) || t("rules.invalid-ror-code")
            })
            break
          case "DOI":
            rules.push((value) => {
              return !!doiRules(value) || t("rules.invalid-doi-code")
            })
            break
          case "date":
            rules.push((value) => {
              return !!dateRules(value) || t("rules.invalid-date")
            })
            break
          case "digit":
            rules.push((value) => {
              return digitRules(value) || t("rules.only-digits-allowed")
            })
            break
          case "orcid":
            rules.push((value) => {
              return !!orcidRules(value) || t("rules.invalid-orcid")
            })
            break
        }
      })
    }
    
    return rules
  }

  return {
    requiredRules,
    alphaRules,
    minRules,
    maxRules,
    urlRules,
    emailRules,
    ytRules,
    colorRules,
    rorRules,
    doiRules,
    dateRules,
    orcidRules,
    digitRules,
    computeInputVisibility,
    generateInputRules
  }
}
