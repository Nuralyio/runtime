import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../../helper/common_attributes.ts";
import { InputBlockContainerTheme } from "../../../utils/common-editor-theme.ts";

export const DropdownData=  [
  {
    uuid: "dropdown_data",
    application_id: "1",
    name: "dropdown_handler_blocks",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      ...InputBlockContainerTheme
    },
    childrenIds: ["dropdown_handler_label", "dropdown_event_handler"]
  },
  {
    uuid: "dropdown_handler_label",
    name: "label image src",
    component_type: ComponentType.TextLabel,
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "handler",
        value: /* js */`
               return "Data"
            `
      }
    }
  },
  {
    uuid: "dropdown_event_handler",
    application_id: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "label handler",
    style: {
      display: "block",
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
                const parameter = 'options';
                let labelHandler = '';
                const selectedComponent = Utils.first(Vars.selectedComponents);
                if (selectedComponent?.input?.options?.type === 'handler' && selectedComponent?.input?.options?.value) {
                    labelHandler = selectedComponent?.input?.options.value;
                }else if (selectedComponent?.input?.options?.type ===  "array" && selectedComponent?.input?.options?.value) {
                    labelHandler = JSON.stringify(selectedComponent?.input?.options.value, null, 2);
                }
                return [parameter, labelHandler];
            `
      }
    },

    event: {
      codeChange: /* js */ `
                const selectedComponent = Utils.first(Vars.selectedComponents);
                if (EventData.value !== selectedComponent?.input?.options?.value) {
                    if(selectedComponent?.input?.options?.type !=  "handler"){
                         updateInput(selectedComponent, 'options', selectedComponent?.input?.options?.type, JSON.parse(EventData.value));
                    }else{
                        updateInput(selectedComponent, 'options', 'handler', EventData.value);

                    }
                }
      `
    }
  }
];
