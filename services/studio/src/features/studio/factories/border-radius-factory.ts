import { ComponentType } from "@shared/redux/store/component/component.interface.ts";
import { createBaseComponent, createTextLabel } from "./component-builders.ts";

/**
 * Factory for creating border radius components
 * This factory creates a complete border radius block with container, label, input, and handler
 */
export const createBorderRadiusBlock = (config: {
  containerUUID?: string;
  labelUUID?: string;
  inputUUID?: string;
  handlerUUID?: string;
  label?: string;
  containerStyle?: Record<string, string>;
  labelStyle?: Record<string, string>;
  inputStyle?: Record<string, string>;
}) => {
  const {
    containerUUID = "border_radius_vertical_container",
    labelUUID = "border_radius_label",
    inputUUID = "border_radius_block", 
    handlerUUID = "label_border_radius_handler",
    label = " ", // Empty space as default
    containerStyle = {},
    labelStyle = {},
    inputStyle = {}
  } = config;

  // Default container styles
  const defaultContainerStyle = {
    display: "flex",
    "align-items": "center",
    "justify-content": "space-between",
    "width": "276px",
    ...containerStyle
  };

  // Default label styles
  const defaultLabelStyle = {
    width: "90px",
    ...labelStyle
  };

  // Default input styles
  const defaultInputStyle = {
    width: "50px",
    ...inputStyle
  };

  // Create container component
  const containerComponent = createBaseComponent(
    containerUUID,
    "Left panel",
    ComponentType.Container,
    {
      style: defaultContainerStyle,
      childrenIds: [labelUUID, inputUUID, handlerUUID]
    }
  );

  // Create label component
  const labelComponent = createTextLabel(
    labelUUID,
    label,
    defaultLabelStyle
  );

  // Create the BorderRadius component with custom events and complex input handlers
  const borderRadiusComponent = createBaseComponent(
    inputUUID,
    "border radius block",
    ComponentType.BorderRadius,
    {
      style: defaultInputStyle,
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

  // Create handler component
  const handlerComponent = createBaseComponent(
    handlerUUID,
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

  return [
    containerComponent,
    labelComponent,
    borderRadiusComponent,
    handlerComponent
  ];
};

/**
 * Creates a simplified border radius input component (just the input part)
 */
export const createBorderRadiusInput = (config: {
  uuid?: string;
  style?: Record<string, string>;
}) => {
  const {
    uuid = "border_radius_input",
    style = {}
  } = config;

  const defaultStyle = {
    width: "50px",
    ...style
  };

  return createBaseComponent(
    uuid,
    "border radius input",
    ComponentType.BorderRadius,
    {
      style: defaultStyle,
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
        value: {
          type: "handler",
          value: /* js */`
            const selectedComponent = Utils.first(Vars.selectedComponents);
            if (selectedComponent) {
              const currentEditingAppUUID = GetVar("currentEditingApplication").uuid;
              const currentComponent = GetComponent(selectedComponent, currentEditingAppUUID);
              
              if (selectedComponent.style) {
                const borderRadius = selectedComponent.style['border-radius'];
                if (borderRadius) {
                  let value = '';
                  let unit = '';
                  
                  borderRadius.split('').forEach((char) => {  
                    if ((char >= '0' && char <= '9') || char === '.') {
                      value += char;
                    } else {
                      unit += char;
                    }
                  });

                  return {
                    value: parseFloat(value) || 0,
                    unit: unit || 'px'
                  };
                }
              }
              
              return {
                value: 0,
                unit: 'px'
              };
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
};
