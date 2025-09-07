import { fontSizeValueHandler, fontSizeEventHandler } from "../factories/handlers/typography-handlers.ts";

export const fontSizeConfig = {
  property: 'fontSize',  // Note: fontSize (camelCase) not font-size (kebab-case)
  label: 'Font size',
  inputType: 'number' as const,
  defaultValue: '16px',
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
    width: "100px",
    size: "small"
  },
  numberConfig: {
    value: "22px",
    min: 8,
    max: 72,
    step: 1
  },
  // Custom handlers for complex font-size logic
  customValueHandler: fontSizeValueHandler,
  customEventHandler: fontSizeEventHandler,
  // Match existing UUID pattern exactly
  uuidPattern: {
    block: "font_size_vertical_container",
    label: "text_label_font_size",
    input: "font_size_input_2", 
    handler: "label_fontsize_handler"
  }
};
