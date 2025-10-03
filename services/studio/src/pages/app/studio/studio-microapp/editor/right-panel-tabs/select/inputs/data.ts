import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../../helper/common_attributes.ts";
import { InputBlockContainerTheme } from "../../../utils/common-editor-theme.ts";

export default [
  {
    uuid: "select_values_handler_block",
    application_id: "1",
    name: "value handler block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      ...InputBlockContainerTheme
    },
    childrenIds: ["select_values_label", "select_values_handler"]
  },
  {
    uuid: "select_values_label",
    name: "select values label",
    component_type: ComponentType.TextLabel,
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    style: {
      width: "90px"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
          const label = 'Data';
          return label;
        `
      }
    }
  },
  {
    uuid: "select_values_handler",
    application_id: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "value handler",
    style: {
      display: "block",
      width: "50px"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
          const parameter = 'value';
          let valueHandler = '';
          const selectedComponent = Utils.first(Vars.selectedComponents);
          
          if(selectedComponent.input?.options?.type == 'handler' && selectedComponent.input?.options?.value) {
            valueHandler = selectedComponent.input?.options?.value;
          }
          
          return [parameter, valueHandler];
        `
      }
    },
    event: {
      codeChange: /* js */ `
        const selectedComponent = Utils.first(Vars.selectedComponents);
        
        if(EventData.value != selectedComponent.input?.options?.value) {
          updateInput(selectedComponent, 'options', 'handler', EventData.value);
        }
      `
    }
  }
];
