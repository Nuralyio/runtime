import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../../helper/common_attributes.ts";
import { InputBlockContainerTheme } from "../../../utils/common-editor-theme.ts";

export default [
  {
    uuid: "collection_data",
    application_id: "1",
    name: "collection_handler_blocks",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      ...InputBlockContainerTheme
    },
    childrenIds: ["collection_handler_label", "collection_event_handler"]
  },
  {
    uuid: "collection_handler_label",
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
    uuid: "collection_event_handler",
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
                const parameter = 'data';
                let labelHandler = '';
                
                const selectedComponent = Utils.first(Editor.selectedComponents);
                if (selectedComponent?.input?.data?.type === 'handler' && selectedComponent?.input?.data?.value) {
                    labelHandler = selectedComponent?.input?.data.value;
                }
                
                return [parameter, labelHandler];
            `
      }
    },

    event: {
      codeChange: /* js */ `
                const selectedComponent = Utils.first(Editor.selectedComponents);
                if (EventData.value !== selectedComponent?.input?.data?.value) {
                    updateInput(selectedComponent, 'data', 'handler', EventData.value);
                }
      `
    }
  }
];
