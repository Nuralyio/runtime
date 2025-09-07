import { lineHeightValueHandler, lineHeightEventHandler } from "../factories/handlers/typography-handlers.ts";

export const lineHeightConfig = {
  property: 'line-height',
  label: 'Line height',
  inputType: 'number' as const,
  defaultValue: '1.5',
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
    value: "1.5",
    min: 0.5,
    max: 3,
    step: 0.1
  },
  // Custom handlers for line-height (can be unitless or with units)
  customValueHandler: lineHeightValueHandler,
  customEventHandler: lineHeightEventHandler,
  // Match existing UUID pattern
  uuidPattern: {
    block: "line_height_block",
    label: "text_label_line_height",
    input: "line_height_input_2",
    handler: "line_height_handler"
  }
};
