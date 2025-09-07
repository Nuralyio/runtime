import { ComponentType } from "$store/component/interface.ts";
import { createBaseComponent, createTextLabel } from "./component-builders.ts";
import {
  createRadioInput,
  createColorInput,
  createNumberInput,
  createSelectInput
} from "./input-components/index.ts";

// Simplified style block factory using modular input components
export const createStyleBlock = (config: {
  property: string;
  label: string;
  inputType: 'radio' | 'color' | 'number' | 'select';
  defaultValue: string;
  containerStyle?: Record<string, string>;
  labelStyle?: Record<string, string>;
  inputStyle?: Record<string, string>;
  options?: Array<{ value: string; icon?: string; label?: string }>;
  numberConfig?: Record<string, any>;
  theme?: Record<string, string>;
  // Allow custom UUID patterns
  uuidPattern?: {
    block?: string;
    label?: string;
    input?: string;
    handler?: string;
  };
  // Allow custom handlers for complex logic
  customValueHandler?: string;
  customEventHandler?: string;
}) => {
  const { 
    property, 
    label, 
    inputType, 
    defaultValue, 
    containerStyle = {},
    labelStyle = {},
    inputStyle = {},
    options = [],
    numberConfig = {},
    theme = {},
    uuidPattern = {},
    customValueHandler,
    customEventHandler
  } = config;
  
  const baseId = property.replace('-', '_');
  const propertyVar = property.replace('-', '');
  const capitalizedProperty = property.charAt(0).toUpperCase() + property.slice(1).replace('-', '');
  
  // Generate UUIDs - use custom pattern or default
  const uuids = {
    block: uuidPattern.block || `${baseId}_block`,
    label: uuidPattern.label || `text_label_${baseId}`,
    input: uuidPattern.input || generateInputUUID(baseId, inputType),
    handler: uuidPattern.handler || `${baseId}_handler`
  };
  
  // Default styles
  const defaultContainerStyle = {
    display: "flex",
    "align-items": "center",
    "justify-content": "space-between",
    "width": "276px",
    ...containerStyle
  };
  
  const defaultLabelStyle = {
    width: "90px",
    ...labelStyle
  };

  // Create the input component based on type
  const inputComponent = createInputComponent({
    inputType,
    baseId,
    property,
    capitalizedProperty,
    defaultValue,
    inputStyle,
    options,
    numberConfig,
    theme,
    customUUID: uuids.input,
    customValueHandler,
    customEventHandler
  });

  return [
    // Container
    createBaseComponent(uuids.block, "Left panel", ComponentType.Container, {
      styleHandlers: {},
      input: { direction: "vertical" },
      style: defaultContainerStyle,
      childrenIds: [uuids.label, uuids.input, uuids.handler]
    }),
    
    // Label
    createTextLabel(uuids.label, label, defaultLabelStyle),
    
    // Input Component
    inputComponent,
    
    // Handler
    createBaseComponent(uuids.handler, `${property} handler`, ComponentType.Event, {
      styleHandlers: {},
      style: { display: "block", width: "250px" },
      input: {
        value: {
          type: "handler",
          value: /* js */ `
            // Handle special parameter names for specific properties
            let parameter = '${propertyVar}';
            if ('${property}' === 'fontSize') {
              parameter = 'labelFontSize';
            }
            
            let ${propertyVar}Handler = '';
            const selectedComponent = Utils.first(Vars.selectedComponents);
            ${propertyVar}Handler = selectedComponent?.styleHandlers && selectedComponent?.styleHandlers['${property}'] || '';  
            return [parameter, ${propertyVar}Handler];
          `
        }
      },
      event: {
        codeChange: /* js */ `
          const selectedComponent = Utils.first(Vars.selectedComponents);
          updateStyleHandlers(selectedComponent, '${property}', EventData.value);
        `
      }
    })
  ];
};

// Helper function to generate appropriate UUID for input based on type
function generateInputUUID(baseId: string, inputType: string): string {
  switch (inputType) {
    case 'radio':
      return `${baseId}_content`;
    case 'color':
      return `${baseId}_input_2`; // Match existing pattern like font_color_input_2
    case 'number':
      return `${baseId}_input_2`;
    case 'select':
      return `${baseId}_select`;
    default:
      return `${baseId}_input`;
  }
}

// Helper function to create the appropriate input component
function createInputComponent(config: {
  inputType: string;
  baseId: string;
  property: string;
  capitalizedProperty: string;
  defaultValue: string;
  inputStyle: Record<string, string>;
  options: Array<{ value: string; icon?: string; label?: string }>;
  numberConfig: Record<string, any>;
  theme: Record<string, string>;
  customUUID: string;
  customValueHandler?: string;
  customEventHandler?: string;
}) {
  const { inputType, customValueHandler, customEventHandler, ...rest } = config;

  // Pass custom handlers to components that support them
  const componentConfig = { 
    ...rest, 
    customValueHandler, 
    customEventHandler 
  };

  switch (inputType) {
    case 'radio':
      return createRadioInput(componentConfig);
    case 'color':
      return createColorInput(componentConfig);
    case 'number':
      return createNumberInput(componentConfig);
    case 'select':
      return createSelectInput(componentConfig);
    default:
      throw new Error(`Unsupported input type: ${inputType}`);
  }
}
