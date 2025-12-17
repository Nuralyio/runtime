import { COMMON_ATTRIBUTES } from "../../core/helpers/common_attributes.ts";

// Helper functions (inlined from factories)
const createBaseComponent = (uuid: string, name: string, componentType: string, additionalProps = {}) => ({
  uuid,
  name,
  application_id: "1",
  component_type: componentType,
  ...COMMON_ATTRIBUTES,
  ...additionalProps
});

const createTextLabel = (uuid: string, text: string, style = {}) =>
  createBaseComponent(uuid, "text_label", "text_label", {
    parameters: { value: text },
    input: {
      value: {
        type: "string",
        value: text
      }
    },
    style
  });

// Create validation rules components
const containerComponent = createBaseComponent(
  "validation_rules_vertical_container",
  "Validation Rules Container",
  "vertical-container-block",
  {
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between",
      "width": "100%"
    },
    childrenIds: ["validation_rules_label", "validation_rules_display_block"]
  }
);

const labelComponent = createTextLabel(
  "validation_rules_label",
  " ",
  { width: "0px", display: "none" }
);

const validationRulesComponent = createBaseComponent(
  "validation_rules_display_block",
  "validation rules display block",
  "validation_rules",
  {
    style: { width: "100%", display: "block" },
    input: {
      value: {
        type: "handler",
        value: /* js */`
          const selectedComponent = Utils.first(Vars.selectedComponents);
          if (!selectedComponent) return {};

          const input = selectedComponent.input || {};

          return {
            required: input.required?.value || false,
            minLength: input.minLength?.value ?? null,
            maxLength: input.maxLength?.value ?? null,
            min: input.min?.value ?? null,
            max: input.max?.value ?? null,
            pattern: input.pattern?.value || '',
            rules: input.rules?.value || []
          };
        `
      }
    },
    event: {
      onChange: /* js */`
        const selectedComponent = Utils.first(Vars.selectedComponents);
        if (!selectedComponent) return;

        const property = EventData.property;
        const type = EventData.type;
        const value = EventData.value;

        // Update the component input with the new value
        updateInput(selectedComponent, property, type, value);
      `
    }
  }
);

const collapseComponent = createBaseComponent(
  "validation_rules_collapse",
  "Validation Rules Collapse",
  "Collapse",
  {
    style: {
      marginTop: "8px",
      marginBottom: "8px",
      "--nuraly-spacing-collapse-padding": "0px",
      "--nuraly-spacing-collapse-content-padding": "0px",
      "--nuraly-shadow-collapse-hover": "none",
      "--nuraly-border-radius-collapse": "0",
      "--nuraly-border-radius-collapse-header": "0"
    },
    input: {
      size: {
        type: "string",
        value: "small"
      },
      components: {
        type: "array",
        value: [{
          blockName: "validation_rules_vertical_container",
          label: "Validation",
          open: true
        }]
      }
    },
    childrenIds: ["validation_rules_vertical_container"]
  }
);

export const studioValidationRulesBlock = [
  collapseComponent,
  containerComponent,
  labelComponent,
  validationRulesComponent
];

export default studioValidationRulesBlock;
