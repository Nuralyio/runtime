import { ComponentType } from "@shared/redux/store/component/component.interface.ts";
import { COMMON_ATTRIBUTES } from "../../core/helpers/common_attributes.ts";

// Helper functions (inlined from factories)
const createBaseComponent = (uuid: string, name: string, componentType: ComponentType, additionalProps = {}) => ({
  uuid,
  name,
  application_id: "1",
  component_type: componentType,
  ...COMMON_ATTRIBUTES,
  ...additionalProps
});

const createTextLabel = (uuid: string, text: string, style = {}) =>
  createBaseComponent(uuid, "text_label", ComponentType.TextLabel, {
    parameters: { value: text },
    input: {
      value: {
        type: "string",
        value: text
      }
    },
    style
  });

// Create box model components
const containerComponent = createBaseComponent(
  "box_model_vertical_container",
  "Box Model Container",
  ComponentType.Container,
  {
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between",
      "width": "100%"
    },
    childrenIds: ["box_model_label", "box_model_display_block"]
  }
);

const labelComponent = createTextLabel(
  "box_model_label",
  "Box Model",
  { width: "90px", fontWeight: "500" }
);

const boxModelComponent = createBaseComponent(
  "box_model_display_block",
  "box model display block",
  ComponentType.BoxModel,
  {
    style: { width: "100%" },
    input: {
      value: {
        type: "handler",
        value: /* js */`
          const selectedComponent = Utils.first(Vars.selectedComponents);
          if (selectedComponent) {
            const currentEditingAppUUID = GetVar("currentEditingApplication").uuid;
            const currentComponent = GetComponent(selectedComponent, currentEditingAppUUID);

            if (selectedComponent.style) {
              const propertiesToExtract = [
                "margin-left",
                "margin-top",
                "margin-bottom",
                "margin-right",
                "padding-left",
                "padding-right",
                "padding-top",
                "padding-bottom",
                "border",
                "width",
                "height"
              ];

              const extractedStyles = {};

              propertiesToExtract.forEach((prop) => {
                const propValue = selectedComponent.style[prop];
                if (propValue) {
                  let value = '';
                  let unit = '';

                  propValue.split('').forEach((char) => {
                    if ((char >= '0' && char <= '9') || char === '.') {
                      value += char;
                    } else {
                      unit += char;
                    }
                  });

                  const numericValue = parseFloat(value) || 0;
                  const unitType = unit || 'px'; // Default to 'px' if unit is missing

                  extractedStyles[prop] = {
                    value: numericValue,
                    unit: unitType
                  };
                } else {
                  extractedStyles[prop] = {
                    value: 0,
                    unit: 'px'
                  };
                }
              });

              return extractedStyles;
            } else {
              return {
                "margin-left": { value: 0, unit: 'px' },
                "margin-right": { value: 0, unit: 'px' },
                "padding-left": { value: 0, unit: 'px' },
                "padding-right": { value: 0, unit: 'px' },
                "margin-top": { value: 0, unit: 'px' },
                "margin-bottom": { value: 0, unit: 'px' },
                "padding-top": { value: 0, unit: 'px' },
                "padding-bottom": { value: 0, unit: 'px' },
                "border": { value: 0, unit: 'px' },
                "width": { value: 0, unit: 'px' },
                "height": { value: 0, unit: 'px' }
              };
            }
          }
        `
      }
    }
  }
);

export default [
  containerComponent,
  labelComponent,
  boxModelComponent
];
