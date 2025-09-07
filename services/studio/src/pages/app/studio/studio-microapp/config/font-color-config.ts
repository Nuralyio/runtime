export const fontColorConfig = {
  property: 'color',
  label: 'Color',
  inputType: 'color' as const,
  defaultValue: '#000000',
  containerStyle: {
    display: "flex",
    "align-items": "center",
    "justify-content": "space-between",
    "width": "276px"
  },
  labelStyle: {
    width: "90px",
    display: "block"
  },
  inputStyle: {
    width: "100px"
  },
  // Match existing UUID pattern
  uuidPattern: {
    block: "font_color_block",
    label: "font_color_label", 
    input: "font_color_input_2",
    handler: "font_color_handler"
  }
};
