export const fontStyleConfig = {
  property: 'font-style',
  label: 'Font style',
  inputType: 'radio' as const,
  defaultValue: 'normal',
  options: [
    { value: 'normal', icon: "font" },
    { value: 'italic', icon: "italic" },
    { value: 'oblique', icon: "font" }
  ],
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
    "--hybrid-button-height": "26px",
    "--hybrid-button-width": "31px"
  },
  // Match existing UUID pattern
  uuidPattern: {
    block: "font_style_block",
    label: "text_label_font_style",
    input: "font_style_content",
    handler: "font_style_handler"
  }
};
