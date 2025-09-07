export const fontFamilyConfig = {
  property: 'font-family',
  label: 'Font family',
  inputType: 'select' as const,
  defaultValue: 'Arial, sans-serif',
  containerStyle: {
    display: "flex",
    "align-items": "center",
    "justify-content": "space-between",
    "width": "276px"
  },
  labelStyle: {
    width: "90px"
  },
  inputStyle: {
    width: "150px"
  },
  options: [
    { value: 'Arial, sans-serif', label: 'Arial' },
    { value: 'Helvetica, sans-serif', label: 'Helvetica' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: 'Times New Roman, serif', label: 'Times New Roman' },
    { value: 'Verdana, sans-serif', label: 'Verdana' },
    { value: 'Monaco, monospace', label: 'Monaco' },
    { value: 'Courier New, monospace', label: 'Courier New' }
  ],
  // Match existing UUID pattern
  uuidPattern: {
    block: "font_family_block",
    label: "font_family_label",
    input: "font_family_select",
    handler: "font_family_handler"
  }
};
