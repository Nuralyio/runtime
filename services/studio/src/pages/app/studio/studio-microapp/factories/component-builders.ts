import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";

export const createBaseComponent = (uuid: string, name: string, componentType: ComponentType, additionalProps = {}) => ({
  uuid,
  name,
  application_id: "1",
  component_type: componentType,
  ...COMMON_ATTRIBUTES,
  ...additionalProps
});

export const createTextLabel = (uuid: string, text: string, style = {}) => 
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

export const createStyleHandler = (property: string) => {
  const capitalizedProperty = property.charAt(0).toUpperCase() + property.slice(1).replace('-', '');
  
  return {
    getHandler: /* js */ `
      const selectedComponent = Utils.first(Vars.selectedComponents);
      let default${capitalizedProperty} = '';
      let isDisabled = false;
      if (selectedComponent?.styleHandlers && selectedComponent?.styleHandlers['${property}']) {
        isDisabled = true;
      } else {
        default${capitalizedProperty} = Editor.getComponentStyle(selectedComponent, '${property}') || 'none';
      }
      return [isDisabled, default${capitalizedProperty}];
    `,
    
    updateHandler: /* js */ `
      const selectedComponent = Utils.first(Vars.selectedComponents);
      const ${property.replace('-', '')}Value = EventData.value ? EventData.value : 'none';
      updateStyle(selectedComponent, "${property}", ${property.replace('-', '')}Value);
    `,
    
    codeChangeHandler: /* js */ `
      const selectedComponent = Utils.first(Vars.selectedComponents);
      updateStyleHandlers(selectedComponent, '${property}', EventData.value);
    `
  };
};
