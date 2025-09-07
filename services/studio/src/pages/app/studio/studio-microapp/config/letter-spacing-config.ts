import { letterSpacingValueHandler, letterSpacingEventHandler } from "../factories/handlers/typography-handlers.ts";

export const letterSpacingConfig = {
  property: 'letter-spacing',
  label: 'Letter spacing',
  inputType: 'number' as const,
  defaultValue: '0px',
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
    value: "0px",
    min: -2,
    max: 10,
    step: 0.1
  },
  // Custom handlers for letter-spacing with units
  customValueHandler: letterSpacingValueHandler,
  customEventHandler: letterSpacingEventHandler,
  // Match existing UUID pattern
  uuidPattern: {
    block: "letter_spacing_block",
    label: "text_label_letter_spacing",
    input: "letter_spacing_input_2",
    handler: "letter_spacing_handler"
  }
};
