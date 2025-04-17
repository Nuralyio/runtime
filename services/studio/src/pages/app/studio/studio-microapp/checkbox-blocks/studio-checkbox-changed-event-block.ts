import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";

export default [
  {
    uuid: "checkbox_changed_event_block",
    application_id: "1",
    name: "Checkbox changed event block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {

      display: "flex",
      "justify-content": "space-between",
      "align-items": "center"
    },

    childrenIds: ["text_label_checkbox_changed_event_block", "checkbox_changed_event_value"]
  },
  {
    uuid: "text_label_checkbox_changed_event_block",
    name: "text label checkbox changed event block",
    component_type: ComponentType.TextLabel,

    application_id: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "string",
        value: 'Checkbox change'
      }
    }
  },
  {
    uuid: "checkbox_changed_event_value",
    application_id: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "checkbox changed event value",
    style: {
      display: "block",
      width: "250px"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
                const event ='checkbox-changed';
                let currentEventValue =''
                
                    const selectedComponent = Utils.first(Vars.selectedComponents);
                        
                        
                        if(selectedComponent.event?.checkboxChanged){
                            currentEventValue= selectedComponent.event.checkboxChanged;
                        } 
                
                return [event,currentEventValue];
            `
      }
    },
    event: {
      codeChange: /* js */ `
            
                const selectedComponent = Utils.first(Vars.selectedComponents);
                    updateEvent(selectedComponent, "checkboxChanged",EventData.value )
            
      `
    }
  }
];
