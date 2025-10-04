import { ComponentType } from "@shared/redux/store/component/component.interface.ts";
import { createBaseComponent } from "../component-builders.ts";

export const createColorInput = (config: {
  baseId: string;
  property: string;
  capitalizedProperty: string;
  defaultValue: string;
  inputStyle: Record<string, string>;
  customUUID?: string;
}) => {
  const { baseId, property, capitalizedProperty, defaultValue, inputStyle, customUUID } = config;
  const propertyVar = property.replace('-', '');
  const uuid = customUUID || `${baseId}_input`;

  return createBaseComponent(uuid, "name", ComponentType.ColorPicker, {
    styleHandlers: {},
    style: { ...inputStyle },
    input: {
      value: {
        type: "handler",
        value: /* js */ `
          const selectedComponent = Utils.first(Vars.selectedComponents);
          let default${capitalizedProperty} = '${defaultValue}';
          let isDisabled = false;
          if (selectedComponent?.styleHandlers && selectedComponent?.styleHandlers['${property}']) {
            isDisabled = true;
          } else {
            default${capitalizedProperty} = Editor.getComponentStyle(selectedComponent, '${property}') || '${defaultValue}';
          }
          return [default${capitalizedProperty}, isDisabled];
        `
      }
    },
    event: {
      valueChange: /* js */ `
        const selectedComponent = Utils.first(Vars.selectedComponents);
        const ${propertyVar}Value = EventData.value || '${defaultValue}';
        updateStyle(selectedComponent, "${property}", ${propertyVar}Value);
      `
    }
  });
};
