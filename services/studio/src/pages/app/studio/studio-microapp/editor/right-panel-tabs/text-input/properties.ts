import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../helper/common_attributes.ts";
import { GenericJsonProcessor, type BlockConfig } from "../../../config/json-processor.ts";
import { createHandlersFromEvents } from "../../utils/handler-generator.ts";
import { generateComponents } from "../../../common-blocks/studio-theme-block.ts";
import textInputFieldsConfigRaw from "./_text-input-config.json";
import textInputHandlersConfigRaw from "./_text-input-handlers.json";
import cssVarsRaw from "./_text-input-theme.json";

// Type assertions for the JSON configs
const textInputFieldsConfig = textInputFieldsConfigRaw as { textInputFields: BlockConfig };
const textInputHandlersConfig = textInputHandlersConfigRaw as { 
  handlerPrefix: string; 
  events: Array<{ name: string; label: string }> 
};

type CssVarItem = { 
  label: string; 
  cssVar: string;
  type?: "color" | "text" | "number" | "select";
  defaultValue?: string;
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
};
type CssVarGroup = { name: string; items: CssVarItem[]; open?: boolean };
type CssVarSection = { name: string; open?: boolean; items: CssVarGroup[] };

const cssVars = cssVarsRaw as CssVarSection[];

// Generate text-input field components from JSON config
const textInputFieldsComponents = GenericJsonProcessor.generateFromConfig(
  textInputFieldsConfig.textInputFields,
  'textInputFields'
);

// Generate handlers from JSON config
const textInputHandlers = createHandlersFromEvents(
  textInputHandlersConfig.events,
  textInputHandlersConfig.handlerPrefix
);

// Generate theme components from JSON config
const textInputTheme = generateComponents(cssVars, "text_input_icon_theme_container");

// Design properties (functional inputs)
const StudioTextInputDesign = [
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
  ...textInputFieldsComponents,  // Text input specific fields - JSON-based
  ...textInputHandlers  // Text input event handlers - JSON-based
];

// Export combined properties (design + theme)
export const StudioTextInput = [
  ...StudioTextInputDesign,
  ...textInputTheme
];
