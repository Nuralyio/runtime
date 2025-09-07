import { borderRadiusValueHandler, borderRadiusEventHandler } from "../factories/handlers/border-handlers.ts";

export const borderRadiusConfig = {
  property: 'border-radius',
  label: 'Border radius',
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
    min: 0,
    max: 50,
    step: 1
  },
  // Custom handlers for border-radius with units
  customValueHandler: borderRadiusValueHandler,
  customEventHandler: borderRadiusEventHandler
};
