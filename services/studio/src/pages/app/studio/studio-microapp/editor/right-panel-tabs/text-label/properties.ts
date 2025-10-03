import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../helper/common_attributes.ts";
import { GenericJsonProcessor, type BlockConfig } from "../../../config/json-processor.ts";
import { createHandlersFromEvents } from "../../utils/handler-generator.ts";
import { generateComponents } from "../../../common-blocks/studio-theme-block.ts";
import textLabelFieldsConfigRaw from "./_text-label-config.json";
import textLabelHandlersConfigRaw from "./_text-label-handlers.json";
import cssVarsRaw from "./_text-label-theme.json";

// Type assertions for the JSON configs
const textLabelFieldsConfig = textLabelFieldsConfigRaw as { textLabelFields: BlockConfig };
const textLabelHandlersConfig = textLabelHandlersConfigRaw as { 
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

// Generate text-label field components from JSON config
const textLabelFieldsComponents = GenericJsonProcessor.generateFromConfig(
  textLabelFieldsConfig.textLabelFields,
  'textLabelFields'
);

// Generate handlers from JSON config
const textLabelHandlers = createHandlersFromEvents(
  textLabelHandlersConfig.events,
  textLabelHandlersConfig.handlerPrefix
);

// Generate theme components from JSON config
const textLabelTheme = generateComponents(cssVars, "parent_color_container");

// Design properties (functional inputs)
const StudioTextLabelDesign = [
  {
    uuid: "text_label_bocks",
    application_id: "1",
    name: "Parent Color Container",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "flex-direction": "column"
    },
    childrenIds: [
      "text_label_collapse_container",
      "typography_collapse_container",
      "size_collapse_container",
      "border_collapse_container"
    ]
  },
  ...textLabelFieldsComponents,  // Text label specific fields - JSON-based
  ...textLabelHandlers  // Text label event handlers - JSON-based
];

// Export combined properties (design + theme)
export const StudioTextLabel = [
  ...StudioTextLabelDesign,
  ...textLabelTheme
];
