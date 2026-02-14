/**
 * CSS variable configurations for each component type.
 * Rendered as editable sections in the Style tab of the right panel.
 *
 * To add CSS variables for a new component type, add an entry to COMPONENT_CSS_VARS.
 * The style panel picks it up automatically — no code changes needed.
 */

export interface CssVarConfig {
  label: string;
  cssVar: string;
  type: "color" | "text";
  default: string;
  placeholder?: string;
}

export interface CssVarSection {
  title: string;
  variables: CssVarConfig[];
}

export const COMPONENT_CSS_VARS: Record<string, CssVarSection> = {
  button_input: {
    title: "Button Styling",
    variables: [
      { label: "Primary BG", cssVar: "--nuraly-color-button-primary", type: "color", default: "#1890ff" },
      { label: "Primary Hover", cssVar: "--nuraly-color-button-primary-hover", type: "color", default: "#40a9ff" },
      { label: "Primary Text", cssVar: "--nuraly-color-button-primary-text", type: "color", default: "#ffffff" },
      { label: "Danger BG", cssVar: "--nuraly-color-button-danger", type: "color", default: "#ff4d4f" },
      { label: "Secondary BG", cssVar: "--nuraly-color-button-secondary", type: "color", default: "#f0f0f0" },
      { label: "Border Radius", cssVar: "--nuraly-border-radius-button", type: "text", default: "6px" },
      { label: "Padding X", cssVar: "--nuraly-button-padding-horizontal", type: "text", default: "12px" },
      { label: "Padding Y", cssVar: "--nuraly-button-padding-vertical", type: "text", default: "2px" },
      { label: "Font Size", cssVar: "--nuraly-button-font-size", type: "text", default: "", placeholder: "0.875rem" },
      { label: "Icon Size", cssVar: "--nuraly-button-icon-size", type: "text", default: "", placeholder: "12px" },
      { label: "Icon Gap", cssVar: "--nuraly-button-icon-spacing", type: "text", default: "", placeholder: "6px" },
    ],
  },

  text_label: {
    title: "Label Styling",
    variables: [
      { label: "Text Color", cssVar: "--nuraly-label-text-color", type: "color", default: "#000000" },
      { label: "Secondary", cssVar: "--nuraly-label-secondary-color", type: "color", default: "#666666" },
      { label: "Error", cssVar: "--nuraly-label-error-color", type: "color", default: "#ff4d4f" },
      { label: "Warning", cssVar: "--nuraly-label-warning-color", type: "color", default: "#faad14" },
      { label: "Success", cssVar: "--nuraly-label-success-color", type: "color", default: "#52c41a" },
      { label: "Font Family", cssVar: "--nuraly-label-font-family", type: "text", default: "", placeholder: "system-ui, sans-serif" },
      { label: "Font Size", cssVar: "--nuraly-label-font-size", type: "text", default: "", placeholder: "14px" },
      { label: "Font Weight", cssVar: "--nuraly-label-font-weight", type: "text", default: "", placeholder: "300" },
      { label: "Line Height", cssVar: "--nuraly-label-line-height", type: "text", default: "", placeholder: "auto" },
    ],
  },

  text_input: {
    title: "Input Styling",
    variables: [
      { label: "Background", cssVar: "--nuraly-color-input-background", type: "color", default: "#ffffff" },
      { label: "Text Color", cssVar: "--nuraly-color-input-text", type: "color", default: "rgba(0, 0, 0, 0.88)" },
      { label: "Border", cssVar: "--nuraly-color-input-border", type: "color", default: "#d9d9d9" },
      { label: "Focus Border", cssVar: "--nuraly-color-input-border-focus", type: "color", default: "#1890ff" },
      { label: "Placeholder", cssVar: "--nuraly-color-input-placeholder", type: "color", default: "#a8a8a8" },
      { label: "Font Size", cssVar: "--nuraly-font-size-input", type: "text", default: "", placeholder: "14px" },
      { label: "Border Radius", cssVar: "--nuraly-border-radius-input", type: "text", default: "6px" },
      { label: "Padding X", cssVar: "--nuraly-spacing-input-medium-horizontal", type: "text", default: "11px" },
      { label: "Padding Y", cssVar: "--nuraly-spacing-input-medium-vertical", type: "text", default: "4px" },
      { label: "Focus Shadow", cssVar: "--nuraly-shadow-input-focus", type: "text", default: "", placeholder: "0 0 0 2px rgba(24,144,255,0.2)" },
    ],
  },

  container: {
    title: "Container Styling",
    variables: [
      { label: "Background", cssVar: "--nuraly-container-background", type: "color", default: "transparent" },
    ],
  },

  image: {
    title: "Image Styling",
    variables: [
      { label: "Radius TL", cssVar: "--nuraly-image-border-top-left-radius", type: "text", default: "", placeholder: "0px" },
      { label: "Radius TR", cssVar: "--nuraly-image-border-top-right-radius", type: "text", default: "", placeholder: "0px" },
      { label: "Radius BL", cssVar: "--nuraly-image-border-bottom-left-radius", type: "text", default: "", placeholder: "0px" },
      { label: "Radius BR", cssVar: "--nuraly-image-border-bottom-right-radius", type: "text", default: "", placeholder: "0px" },
    ],
  },

  checkbox: {
    title: "Checkbox Styling",
    variables: [
      { label: "Background", cssVar: "--nuraly-color-checkbox-background", type: "color", default: "#ffffff" },
      { label: "Border", cssVar: "--nuraly-color-checkbox-border", type: "color", default: "#d9d9d9" },
      { label: "Checked BG", cssVar: "--nuraly-color-checkbox-checked-background", type: "color", default: "#1890ff" },
      { label: "Checkmark", cssVar: "--nuraly-color-checkbox-checkmark", type: "color", default: "#ffffff" },
      { label: "Label Color", cssVar: "--nuraly-color-checkbox-label", type: "color", default: "rgba(0, 0, 0, 0.88)" },
      { label: "Border Hover", cssVar: "--nuraly-color-checkbox-border-hover", type: "color", default: "#40a9ff" },
      { label: "Size", cssVar: "--nuraly-size-checkbox-medium", type: "text", default: "16px" },
      { label: "Border Radius", cssVar: "--nuraly-border-radius-checkbox", type: "text", default: "2px" },
      { label: "Gap", cssVar: "--nuraly-spacing-checkbox-gap", type: "text", default: "8px" },
    ],
  },

  select: {
    title: "Select Styling",
    variables: [
      { label: "Background", cssVar: "--nuraly-select-background", type: "color", default: "#ffffff" },
      { label: "Text Color", cssVar: "--nuraly-select-color", type: "color", default: "#000000" },
      { label: "Border", cssVar: "--nuraly-select-border-color", type: "color", default: "#d9d9d9" },
      { label: "Placeholder", cssVar: "--nuraly-select-placeholder-color", type: "color", default: "#8c8c8c" },
      { label: "Option Hover", cssVar: "--nuraly-select-option-hover-background", type: "color", default: "#f5f5f5" },
      { label: "Selected BG", cssVar: "--nuraly-select-option-selected-background", type: "color", default: "#1890ff" },
      { label: "Selected Text", cssVar: "--nuraly-select-option-selected-color", type: "color", default: "#ffffff" },
      { label: "Dropdown BG", cssVar: "--nuraly-select-dropdown-background", type: "color", default: "#ffffff" },
      { label: "Font Size", cssVar: "--nuraly-select-font-size", type: "text", default: "", placeholder: "14px" },
      { label: "Border Radius", cssVar: "--nuraly-select-border-radius", type: "text", default: "6px" },
    ],
  },

  icon: {
    title: "Icon Styling",
    variables: [
      { label: "Color", cssVar: "--nuraly-color-icon", type: "color", default: "#161616" },
      { label: "Hover Color", cssVar: "--nuraly-color-icon-hover", type: "color", default: "#0f62fe" },
      { label: "Active Color", cssVar: "--nuraly-color-icon-active", type: "color", default: "#054ada" },
      { label: "Size", cssVar: "--nuraly-icon-size", type: "text", default: "18px" },
    ],
  },

  textarea: {
    title: "Textarea Styling",
    variables: [
      { label: "Background", cssVar: "--nuraly-color-textarea-background", type: "color", default: "#ffffff" },
      { label: "Text Color", cssVar: "--nuraly-color-textarea-text", type: "color", default: "#262626" },
      { label: "Border", cssVar: "--nuraly-color-textarea-border", type: "color", default: "#d9d9d9" },
      { label: "Focus Border", cssVar: "--nuraly-color-textarea-border-focus", type: "color", default: "#7c3aed" },
      { label: "Placeholder", cssVar: "--nuraly-color-textarea-placeholder", type: "color", default: "#8c8c8c" },
      { label: "Font Size", cssVar: "--nuraly-font-size-textarea", type: "text", default: "", placeholder: "16px" },
      { label: "Border Radius", cssVar: "--nuraly-border-radius-textarea", type: "text", default: "6px" },
      { label: "Padding", cssVar: "--nuraly-padding-textarea", type: "text", default: "12px" },
    ],
  },

  date_picker: {
    title: "Date Picker Styling",
    variables: [
      { label: "Background", cssVar: "--nuraly-color-datepicker-background", type: "color", default: "#ffffff" },
      { label: "Text Color", cssVar: "--nuraly-color-datepicker-text", type: "color", default: "#000000" },
      { label: "Primary", cssVar: "--nuraly-color-datepicker-primary", type: "color", default: "#1677ff" },
      { label: "Selected BG", cssVar: "--nuraly-color-datepicker-selected", type: "color", default: "#1677ff" },
      { label: "Selected Text", cssVar: "--nuraly-color-datepicker-selected-text", type: "color", default: "#ffffff" },
      { label: "Hover BG", cssVar: "--nuraly-color-datepicker-hover", type: "color", default: "#f5f5f5" },
      { label: "Border", cssVar: "--nuraly-color-datepicker-border", type: "color", default: "#d9d9d9" },
      { label: "Input Focus", cssVar: "--nuraly-color-datepicker-input-focus-border", type: "color", default: "#1677ff" },
      { label: "Border Radius", cssVar: "--nuraly-border-radius-datepicker", type: "text", default: "8px" },
      { label: "Font Size", cssVar: "--nuraly-font-size-datepicker", type: "text", default: "", placeholder: "14px" },
    ],
  },

  slider: {
    title: "Slider Styling",
    variables: [
      { label: "Track", cssVar: "--nuraly-color-slider-input-track", type: "color", default: "#e5e7eb" },
      { label: "Track Filled", cssVar: "--nuraly-color-slider-input-track-filled", type: "color", default: "#3b82f6" },
      { label: "Thumb", cssVar: "--nuraly-color-slider-input-thumb", type: "color", default: "#ffffff" },
      { label: "Thumb Border", cssVar: "--nuraly-color-slider-input-thumb-border", type: "color", default: "#3b82f6" },
      { label: "Track Height", cssVar: "--nuraly-size-slider-input-track-height", type: "text", default: "8px" },
      { label: "Thumb Size", cssVar: "--nuraly-size-slider-input-thumb-diameter", type: "text", default: "20px" },
      { label: "Border Radius", cssVar: "--nuraly-border-slider-input-radius", type: "text", default: "6px" },
    ],
  },

  badge: {
    title: "Badge Styling",
    variables: [
      { label: "Background", cssVar: "--nuraly-color-error", type: "color", default: "#ff4d4f" },
      { label: "Font Size", cssVar: "--nuraly-badge-text-font-size", type: "text", default: "12px" },
      { label: "Height", cssVar: "--nuraly-badge-indicator-height", type: "text", default: "20px" },
      { label: "Dot Size", cssVar: "--nuraly-badge-dot-size", type: "text", default: "6px" },
      { label: "Status Size", cssVar: "--nuraly-badge-status-size", type: "text", default: "6px" },
    ],
  },

  tag: {
    title: "Tag Styling",
    variables: [
      { label: "Text Color", cssVar: "--nuraly-tag-color", type: "color", default: "#000000" },
      { label: "Background", cssVar: "--nuraly-tag-bg", type: "color", default: "#ffffff" },
      { label: "Border", cssVar: "--nuraly-tag-border-color", type: "color", default: "#d9d9d9" },
      { label: "Checked BG", cssVar: "--nuraly-tag-checked-bg", type: "color", default: "#e6f7ff" },
      { label: "Checked Text", cssVar: "--nuraly-tag-checked-color", type: "color", default: "#096dd9" },
      { label: "Font Size", cssVar: "--nuraly-tag-font-size", type: "text", default: "", placeholder: "14px" },
      { label: "Border Radius", cssVar: "--nuraly-tag-radius", type: "text", default: "", placeholder: "4px" },
      { label: "Padding X", cssVar: "--nuraly-tag-padding-x", type: "text", default: "8px" },
      { label: "Padding Y", cssVar: "--nuraly-tag-padding-y", type: "text", default: "0px" },
    ],
  },
};
