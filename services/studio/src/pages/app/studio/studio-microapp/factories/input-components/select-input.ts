import { ComponentType } from "$store/component/interface.ts";
import { createBaseComponent } from "../component-builders.ts";

export const createSelectInput = (config: {
  baseId: string;
  property: string;
  capitalizedProperty: string;
  defaultValue: string;
  options: Array<{ value: string; label?: string }>;
  inputStyle: Record<string, string>;
  customUUID?: string;
}) => {
  const { baseId, property, capitalizedProperty, defaultValue, options, inputStyle, customUUID } = config;
  const propertyVar = property.replace('-', '');
  const uuid = customUUID || `${baseId}_select`;

  return createBaseComponent(uuid, "name", ComponentType.Select, {
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
          const options = ${JSON.stringify(options)};
          return [options, [default${capitalizedProperty}], isDisabled ? 'disabled' : 'enabled'];
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
