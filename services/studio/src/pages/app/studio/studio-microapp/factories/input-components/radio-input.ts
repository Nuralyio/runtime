import { ComponentType } from "$store/component/interface.ts";
import { CommonButtonTheme } from "../../core/utils/common-editor-theme.ts";
import { createBaseComponent } from "../component-builders.ts";

export const createRadioInput = (config: {
  baseId: string;
  property: string;
  capitalizedProperty: string;
  defaultValue: string;
  options: Array<{ value: string; icon?: string }>;
  inputStyle: Record<string, string>;
  theme: Record<string, string>;
  customUUID?: string;
}) => {
  const { baseId, property, capitalizedProperty, defaultValue, options, inputStyle, theme, customUUID } = config;
  const propertyVar = property.replace('-', '');
  const uuid = customUUID || `${baseId}_content`;

  return createBaseComponent(uuid, "name", ComponentType.RadioButton, {
    styleHandlers: {},
    style: { ...inputStyle, ...CommonButtonTheme, ...theme },
    input: {
      value: {
        type: "handler",
        value: /* js */ `
          const selectedComponent = Utils.first(Vars.selectedComponents);
          let default${capitalizedProperty} = '';
          let isDisabled = false;
          if (selectedComponent?.styleHandlers && selectedComponent?.styleHandlers['${property}']) {
            isDisabled = true;
          } else {
            default${capitalizedProperty} = Editor.getComponentStyle(selectedComponent, '${property}') || '${defaultValue}';
          }

          const options = ${JSON.stringify(options)}.map(option => ({
            ...option,
            disabled: isDisabled
          }));

          const radioType = 'button';
          return [options, default${capitalizedProperty}, radioType];           
        `
      }
    },
    event: {
      changed: /* js */ `
        const selectedComponent = Utils.first(Vars.selectedComponents);
        const ${propertyVar}Value = EventData.value || '${defaultValue}';
        updateStyle(selectedComponent, "${property}", ${propertyVar}Value);
      `
    }
  });
};
