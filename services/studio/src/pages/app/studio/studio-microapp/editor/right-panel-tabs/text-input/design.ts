import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../helper/common_attributes.ts";
import { GenericJsonProcessor, type BlockConfig } from "../../../config/json-processor.ts";
import textInputFieldsConfigRaw from "./_text-input-config.json";

// Type assertion for the JSON config
const textInputFieldsConfig = textInputFieldsConfigRaw as { textInputFields: BlockConfig };

// Generate text-input field components from JSON config
const textInputFieldsComponents = GenericJsonProcessor.generateFromConfig(
  textInputFieldsConfig.textInputFields,
  'textInputFields'
);

export const StudioTextInputDesign = [
  {
    uuid: "text_input_blocks",
    application_id: "1",
    name: "Parent Text Input Container",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "flex-direction": "column"
    },
    childrenIds: [
      "text_label_collapse_container",  // Common inputs (Name, ID, Value, Display) - JSON-based
      "text_input_fields_collapse_container",  // All text-input properties - JSON-based
      "typography_collapse_container",  // Typography - JSON-based
      "size_collapse_container",  // Size - JSON-based
      "border_collapse_container"  // Border styling
    ]
  },
  ...textInputFieldsComponents  // Text input specific fields - JSON-based
];