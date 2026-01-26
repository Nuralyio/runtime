/**
 * Property configurations for each component type
 */

export interface PropertyConfig {
  name: string;
  label: string;
  type: "text" | "number" | "boolean" | "select" | "color" | "textarea";
  options?: Array<{ label: string; value: string }>;
  placeholder?: string;
  inputProperty?: string;
  supportsHandler?: boolean;
}

export const COMPONENT_PROPERTIES: Record<string, PropertyConfig[]> = {
  text_label: [
    { name: "value", label: "Text", type: "text", inputProperty: "value", placeholder: "Enter text", supportsHandler: true },
    { name: "size", label: "Size", type: "select", inputProperty: "size", supportsHandler: true, options: [
      { label: "Small", value: "small" },
      { label: "Medium", value: "medium" },
      { label: "Large", value: "large" }
    ]},
    { name: "variant", label: "Variant", type: "select", inputProperty: "variant", supportsHandler: true, options: [
      { label: "Default", value: "default" },
      { label: "Secondary", value: "secondary" },
      { label: "Success", value: "success" },
      { label: "Warning", value: "warning" },
      { label: "Error", value: "error" }
    ]},
    { name: "required", label: "Required", type: "boolean", inputProperty: "required", supportsHandler: true },
    { name: "for", label: "For (Input ID)", type: "text", inputProperty: "for", placeholder: "Enter input ID" }
  ],
  text_input: [
    { name: "value", label: "Value", type: "text", inputProperty: "value", placeholder: "Default value", supportsHandler: true },
    { name: "placeholder", label: "Placeholder", type: "text", inputProperty: "placeholder", supportsHandler: true },
    { name: "size", label: "Size", type: "select", inputProperty: "size", supportsHandler: true, options: [
      { label: "Small", value: "small" },
      { label: "Medium", value: "medium" },
      { label: "Large", value: "large" }
    ]},
    { name: "type", label: "Type", type: "select", inputProperty: "type", options: [
      { label: "Text", value: "text" },
      { label: "Password", value: "password" },
      { label: "Email", value: "email" },
      { label: "Number", value: "number" }
    ]},
    { name: "required", label: "Required", type: "boolean", inputProperty: "required", supportsHandler: true },
    { name: "disabled", label: "Disabled", type: "boolean", inputProperty: "disabled", supportsHandler: true }
  ],
  button_input: [
    { name: "label", label: "Label", type: "text", inputProperty: "label", placeholder: "Button text", supportsHandler: true },
    { name: "variant", label: "Variant", type: "select", inputProperty: "variant", supportsHandler: true, options: [
      { label: "Primary", value: "primary" },
      { label: "Secondary", value: "secondary" },
      { label: "Ghost", value: "ghost" },
      { label: "Danger", value: "danger" }
    ]},
    { name: "size", label: "Size", type: "select", inputProperty: "size", options: [
      { label: "Small", value: "small" },
      { label: "Medium", value: "medium" },
      { label: "Large", value: "large" }
    ]},
    { name: "disabled", label: "Disabled", type: "boolean", inputProperty: "disabled", supportsHandler: true }
  ],
  container: [
    { name: "direction", label: "Direction", type: "select", inputProperty: "direction", options: [
      { label: "Row", value: "row" },
      { label: "Column", value: "column" }
    ]},
    { name: "gap", label: "Gap", type: "text", inputProperty: "gap", placeholder: "e.g., 8px" },
    { name: "padding", label: "Padding", type: "text", inputProperty: "padding", placeholder: "e.g., 16px" }
  ],
  image: [
    { name: "src", label: "Source URL", type: "text", inputProperty: "src", placeholder: "https://...", supportsHandler: true },
    { name: "alt", label: "Alt Text", type: "text", inputProperty: "alt", placeholder: "Image description", supportsHandler: true },
    { name: "objectFit", label: "Object Fit", type: "select", inputProperty: "objectFit", options: [
      { label: "Contain", value: "contain" },
      { label: "Cover", value: "cover" },
      { label: "Fill", value: "fill" },
      { label: "None", value: "none" }
    ]}
  ],
  checkbox: [
    { name: "label", label: "Label", type: "text", inputProperty: "label", supportsHandler: true },
    { name: "checked", label: "Checked", type: "boolean", inputProperty: "checked", supportsHandler: true },
    { name: "disabled", label: "Disabled", type: "boolean", inputProperty: "disabled", supportsHandler: true }
  ],
  select: [
    { name: "placeholder", label: "Placeholder", type: "text", inputProperty: "placeholder", supportsHandler: true },
    { name: "options", label: "Options", type: "text", inputProperty: "options", placeholder: "JSON array", supportsHandler: true },
    { name: "size", label: "Size", type: "select", inputProperty: "size", options: [
      { label: "Small", value: "small" },
      { label: "Medium", value: "medium" },
      { label: "Large", value: "large" }
    ]},
    { name: "searchable", label: "Searchable", type: "boolean", inputProperty: "searchable" },
    { name: "multiple", label: "Multiple", type: "boolean", inputProperty: "multiple" },
    { name: "disabled", label: "Disabled", type: "boolean", inputProperty: "disabled", supportsHandler: true }
  ],
  icon: [
    { name: "name", label: "Icon Name", type: "text", inputProperty: "name", placeholder: "e.g., home", supportsHandler: true },
    { name: "size", label: "Size", type: "text", inputProperty: "size", placeholder: "e.g., 24px" },
    { name: "color", label: "Color", type: "color", inputProperty: "color", supportsHandler: true }
  ],
  textarea: [
    { name: "value", label: "Value", type: "textarea", inputProperty: "value", supportsHandler: true },
    { name: "placeholder", label: "Placeholder", type: "text", inputProperty: "placeholder", supportsHandler: true },
    { name: "rows", label: "Rows", type: "number", inputProperty: "rows", placeholder: "4" },
    { name: "disabled", label: "Disabled", type: "boolean", inputProperty: "disabled", supportsHandler: true }
  ],
  date_picker: [
    { name: "value", label: "Value", type: "text", inputProperty: "value", supportsHandler: true },
    { name: "placeholder", label: "Placeholder", type: "text", inputProperty: "placeholder", supportsHandler: true },
    { name: "format", label: "Format", type: "text", inputProperty: "format", placeholder: "YYYY-MM-DD" },
    { name: "disabled", label: "Disabled", type: "boolean", inputProperty: "disabled", supportsHandler: true }
  ],
  slider: [
    { name: "value", label: "Value", type: "number", inputProperty: "value", supportsHandler: true },
    { name: "min", label: "Min", type: "number", inputProperty: "min", placeholder: "0" },
    { name: "max", label: "Max", type: "number", inputProperty: "max", placeholder: "100" },
    { name: "step", label: "Step", type: "number", inputProperty: "step", placeholder: "1" }
  ],
  badge: [
    { name: "value", label: "Value", type: "text", inputProperty: "value", supportsHandler: true },
    { name: "variant", label: "Variant", type: "select", inputProperty: "variant", options: [
      { label: "Default", value: "default" },
      { label: "Primary", value: "primary" },
      { label: "Success", value: "success" },
      { label: "Warning", value: "warning" },
      { label: "Error", value: "error" }
    ]}
  ],
  tag: [
    { name: "value", label: "Value", type: "text", inputProperty: "value", supportsHandler: true },
    { name: "closable", label: "Closable", type: "boolean", inputProperty: "closable" }
  ]
};
