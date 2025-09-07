// Central configuration for all size-related blocks
import { createStyleBlock } from "../factories/style-block-factory.ts";

// Width configuration
export const widthConfig = {
  property: "width",
  label: "Width",
  inputType: "number" as const,
  defaultValue: "auto",
  numberConfig: {
    unit: "px",
    min: 0,
    max: 2000,
    step: 1
  },
  uuidPattern: {
    block: "width_vertical_container",
    label: "width_label",
    input: "width_number_input",
    handler: "width_handler"
  }
};

// Height configuration
export const heightConfig = {
  property: "height", 
  label: "Height",
  inputType: "number" as const,
  defaultValue: "auto",
  numberConfig: {
    unit: "px",
    min: 0,
    max: 2000,
    step: 1
  },
  uuidPattern: {
    block: "height_vertical_container",
    label: "height_label", 
    input: "height_number_input",
    handler: "height_handler"
  }
};

// Position configuration
export const positionConfig = {
  property: "position",
  label: "Position",
  inputType: "select" as const,
  defaultValue: "static",
  options: [
    { value: "static", label: "Static" },
    { value: "relative", label: "Relative" },
    { value: "absolute", label: "Absolute" },
    { value: "fixed", label: "Fixed" },
    { value: "sticky", label: "Sticky" }
  ],
  uuidPattern: {
    block: "position_block",
    label: "position_label",
    input: "position_select",
    handler: "position_handler"
  }
};

// Cursor configuration
export const cursorConfig = {
  property: "cursor",
  label: "Cursor",
  inputType: "select" as const,
  defaultValue: "default",
  options: [
    { value: "default", label: "Default" },
    { value: "pointer", label: "Pointer" },
    { value: "text", label: "Text" },
    { value: "move", label: "Move" },
    { value: "not-allowed", label: "Not Allowed" },
    { value: "grab", label: "Grab" },
    { value: "grabbing", label: "Grabbing" }
  ],
  uuidPattern: {
    block: "cursor_block",
    label: "cursor_label",
    input: "cursor_select", 
    handler: "cursor_handler"
  }
};

// Generate all size blocks using the factory
export const sizeBlocks = {
  width: createStyleBlock(widthConfig),
  height: createStyleBlock(heightConfig),
  position: createStyleBlock(positionConfig),
  cursor: createStyleBlock(cursorConfig)
};

// Flatten all blocks into a single array for easy import
export const allSizeBlocks = Object.values(sizeBlocks).flat();
