import { marginPaddingValueHandler, marginPaddingEventHandler } from "../factories/handlers/index.ts";

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
  }
  // Line height can be unitless, so uses default handlers
};

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
  customValueHandler: marginPaddingValueHandler('letter-spacing'),
  customEventHandler: marginPaddingEventHandler('letter-spacing')
};
