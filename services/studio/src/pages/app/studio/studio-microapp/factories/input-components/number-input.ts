import { ComponentType } from "$store/component/interface.ts";
import { createBaseComponent } from "../component-builders.ts";

export const createNumberInput = (config: {
  baseId: string;
  property: string;
  capitalizedProperty: string;
  defaultValue: string;
  inputStyle: Record<string, string>;
  numberConfig: Record<string, any>;
  customUUID?: string;
  // Add support for custom handlers
  customValueHandler?: string;
  customEventHandler?: string;
  hasUnits?: boolean;
  hasBreakpoints?: boolean;
}) => {
  const { 
    baseId, 
    property, 
    capitalizedProperty, 
    defaultValue, 
    inputStyle, 
    numberConfig, 
    customUUID,
    customValueHandler,
    customEventHandler,
    hasUnits = false,
    hasBreakpoints = false
  } = config;
  const propertyVar = property.replace('-', '');
  const uuid = customUUID || `${baseId}_input`;

  // Default value handler
  const defaultValueHandler = /* js */ `
    const selectedComponent = Utils.first(Vars.selectedComponents);
    let isDisabled = false;
    if (selectedComponent?.styleHandlers && selectedComponent?.styleHandlers['${property}']) {
      isDisabled = true;
    }
    
    let default${capitalizedProperty} = '${defaultValue}';
    if (!isDisabled) {
      default${capitalizedProperty} = Editor.getComponentStyle(selectedComponent, '${property}') || '${defaultValue}';
    }
    return [default${capitalizedProperty}, isDisabled];
  `;

  // Default event handler
  const defaultEventHandler = /* js */ `
    const selectedComponent = Utils.first(Vars.selectedComponents);
    const ${propertyVar}Value = EventData.value || '${defaultValue}';
    updateStyle(selectedComponent, "${property}", ${propertyVar}Value);
  `;

  return createBaseComponent(uuid, "name", ComponentType.NumberInput, {
    styleHandlers: {},
    style: { width: "100px", size: "small", ...inputStyle },
    input: {
      innerAlignment: {
        type: "string", 
        value: "end"
      },
      value: {
        type: "handler",
        value: customValueHandler || defaultValueHandler
      },
      state: {
        type: "handler",
        value: /* js */ `
          const selectedComponent = Utils.first(Vars.selectedComponents);
          let state = 'enabled';
          if (selectedComponent?.styleHandlers && selectedComponent?.styleHandlers['${property}']) {
            state = 'disabled';
          }
          return state;
        `
      }
    },
    parameters: {
      value: defaultValue,
      ...numberConfig
    },
    event: {
      valueChange: customEventHandler || defaultEventHandler
    }
  });
};
