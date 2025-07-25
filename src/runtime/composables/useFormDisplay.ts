export const computeInputVisibility = (input) => {
  // Simple visibility logic - can be enhanced
  if (input && input.condition) {
    // Implement conditional visibility logic here
    return true
  }
  return true
}

export const getComponentName = (name) => {
  const componentMap = {
    TextField: "FormAtomsTextField",
    TextArea: "FormAtomsTextArea",
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
