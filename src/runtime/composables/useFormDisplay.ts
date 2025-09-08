export const computeConditional = (input) => {
  // Simple visibility logic - can be enhanced
  if (input && input.condition) {
    // Implement conditional visibility logic here
    return true
  }
  return true
}
export const showLabel = (level: any[]) => {
  console.log("level: ", level)
  return (
    (level.length > 1 && Number.isInteger(level[level.length - 1])) ||
    (level.length === 1 && !Number.isInteger(level[0]))
  )
}

export const getComponentName = (name: string, i18n = false) => {
  const componentMap = {
    TextField: i18n ? "FormAtomsI18nTextField" : "FormAtomsTextField",
    TextArea: i18n ? "FormAtomsI18nTextArea" : "FormAtomsTextArea",
    Select: "FormAtomsSelect",
    Checkbox: "FormAtomsCheckbox",
    BooleanSwitch: "FormAtomsBooleanSwitch",
    FileInput: "FormAtomsFileInput",
    AutoComplete: "FormAtomsAutoComplete",
    ColorPicker: "FormAtomsColorPicker",
    DatePicker: "FormAtomsDatePicker",
    DateTimePicker: "FormAtomsDateTimePicker",
    TimePicker: "FormAtomsTimePicker",
    AffiliationPicker: "FormMoleculesAffiliationPicker",
    ImagePicker: "FormMoleculesImagePicker",
    DocumentPicker: "FormMoleculesDocumentPicker",
    ObjectContainerPanel: "FormMoleculesObjectContainerPanel",
    ObjectCollapsiblePanel: "FormMoleculesObjectCollapsiblePanel",
    CollectionContainerPanel: "FormMoleculesCollectionContainerPanel",
    ObjectKeyPairContainer: "FormMoleculesObjectKeyPairContainer",
  }
  if (!componentMap[name]) {
    console.log(
      `Component for type "${name}" not found, defaulting to FormAtomsTextField`
    )
  }
  return componentMap[name] || "FormAtomsTextField"
}

export const getPickerItemComponentName = (category: string) => {
  // Convert category to proper casing and build component name
  const capitalizedCategory =
    category.charAt(0).toUpperCase() + category.slice(1)
  return `FormAtomsPicker${capitalizedCategory}Item`
}
