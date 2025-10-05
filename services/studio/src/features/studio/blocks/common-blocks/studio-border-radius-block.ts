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

// Create border radius components (inlined from factory)
const containerComponent = createBaseComponent(
  "border_radius_vertical_container",
  "Left panel",
  ComponentType.Container,
  {
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between",
      "width": "276px"
    },
    childrenIds: ["border_radius_label", "border_radius_block", "label_border_radius_handler"]
  }
);

const labelComponent = createTextLabel(
  "border_radius_label",
  " ",
  { width: "90px" }
);

const borderRadiusComponent = createBaseComponent(
  "border_radius_block",
  "border radius block",
  ComponentType.BorderRadius,
  {
    style: { width: "50px" },
    event: {
      borderChanged: /* js */ `
        const selectedComponent = Utils.first(Vars.selectedComponents);
        EventData.borders.forEach(border => {
          const keyName = Object.keys(border)[0];
          updateStyle(selectedComponent, keyName, border[keyName]);
        })
      `,
      borderRadiusChanged: /* js */ `
        const selectedComponent = Utils.first(Vars.selectedComponents);
        updateStyle(selectedComponent, EventData.attributeName, EventData.value);
      `
    },
    input: {
      border: {
        type: "handler",
        value: /* js */`
          const selectedComponent = Utils.first(Vars.selectedComponents);
          if (selectedComponent) {
            const currentEditingAppUUID = GetVar("currentEditingApplication").uuid;
            const currentComponent = GetComponent(selectedComponent, currentEditingAppUUID);

            if (selectedComponent.style) {
              const borderProperties = [
                "border",
                "border-top",
                "border-right", 
                "border-bottom",
                "border-left"
              ];
              const styles = Editor.getComponentStyles(currentComponent);
              const borderStyles = Object.keys(styles)
                .filter(key => key === "border" || (key.startsWith("border-") && !key.includes("radius")));
              
              // Extract color and size from border if it exists
              if (styles.border) {
                const borderValue = styles.border;
                const parts = borderValue.split(' ');
                const size = parts[0] || '0px';
                const type = parts[1] || 'solid';
                const color = parts[2] || '#000000';
                
                return [
                  { border: borderValue },
                  { "border-size": size },
                  { "border-type": type },
                  { "border-color": color },
                  ...borderStyles
                    .filter(key => key !== "border")
                    .map(style => ({[style]: styles[style]}))
                ];
              }
              
              return borderStyles.map(style => {
                return {[style]: styles[style]};
              });
            }
          }
        `
      },
      value: {
        type: "handler",
        value: /* js */`
          const selectedComponent = Utils.first(Vars.selectedComponents);
          if (selectedComponent) {
            const currentEditingAppUUID = GetVar("currentEditingApplication").uuid;
            const currentComponent = GetComponent(selectedComponent, currentEditingAppUUID);

            if (selectedComponent.style) {
              const propertiesToExtract = [
                "border-radius",
                "margin-left",
                "margin-top",
                "margin-bottom",
                "margin-right",
                "padding-left",
                "padding-right",
                "padding-top",
                "padding-bottom",
                "border-bottom-right-radius",
                "border-top-right-radius",
                "border-bottom-left-radius",
                "border-top-left-radius",
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
                "border-radius": { value: 0, unit: 'px' },
                "margin-left": { value: 0, unit: 'px' },
                "margin-right": { value: 0, unit: 'px' },
                "padding-left": { value: 0, unit: 'px' },
                "padding-right": { value: 0, unit: 'px' },
                "margin-top": { value: 0, unit: 'px' },
                "margin-bottom": { value: 0, unit: 'px' },
                "padding-top": { value: 0, unit: 'px' },
                "padding-bottom": { value: 0, unit: 'px' },
                "border-bottom-right-radius": { value: 0, unit: 'px' },
                "border-bottom-left-radius": { value: 0, unit: 'px' },
                "border-top-right-radius": { value: 0, unit: 'px' },
                "border-top-left-radius": { value: 0, unit: 'px' },
              };
            }
          }
        `
      },
      state: {
        type: "handler",
        value: /* js */`
          const selectedComponent = Utils.first(Vars.selectedComponents);
          let state = 'enabled';
          if (selectedComponent?.styleHandlers && selectedComponent?.styleHandlers['border-radius']) {
            state = 'disabled';
          }
          return state;
        `
      }
    }
  }
);

const handlerComponent = createBaseComponent(
  "label_border_radius_handler",
  "border-radius handler",
  ComponentType.Event,
  {
    style: { 
      display: "block", 
      width: "250px" 
    },
    input: {
      value: {
        type: "handler",
        value: /* js */ `
          // Handle special parameter names for specific properties
          let parameter = 'borderRadius';
          if ('border-radius' === 'fontSize') {
            parameter = 'labelFontSize';
          }
          
          let borderRadiusHandler = '';
          const selectedComponent = Utils.first(Vars.selectedComponents);
          borderRadiusHandler = selectedComponent?.styleHandlers && selectedComponent?.styleHandlers['border-radius'] || '';  
          return [parameter, borderRadiusHandler];
        `
      }
    },
    event: {
      codeChange: /* js */ `
        const selectedComponent = Utils.first(Vars.selectedComponents);
        updateStyleHandlers(selectedComponent, 'border-radius', EventData.value);
      `
    }
  }
);

export default [
  containerComponent,
  labelComponent,
  borderRadiusComponent,
  handlerComponent
];