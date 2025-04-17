import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";

export default [
  {
    uuid: "button_click_event_block",
    application_id: "1",
    name: "Button click event",
    component_type: ComponentType.Container,
    styleHandlers: {},
    ...COMMON_ATTRIBUTES,
    style: {

      display: "flex",
      "justify-content": "space-between",
      "align-items": "center"
    },

    childrenIds: ["text_label_button_click_event", "button_click_event_value"]
  },
  {
    uuid: "text_label_button_click_event",
    name: "text_label",
    component_type: ComponentType.TextLabel,

    application_id: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "string",
        value: 'Click'
      }
    }
  },
  {
    uuid: "button_click_event_value",
    application_id: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "button click event value",
    style: {
      display: "block",
      width: "250px"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
                const event ='onClick';
                let currentEventValue =''
                    const selectedComponent = Utils.first(Vars.selectedComponents);
                        
                        
                        if(selectedComponent.event?.onClick){
                            currentEventValue= selectedComponent.event.onClick;
                        } 
                return [event,currentEventValue];
            `
      }
    },
    event: {
      codeChange: /* js */ `
                const selectedComponent = Utils.first(Vars.selectedComponents);
                    
                    
                    updateEvent(selectedComponent, "onClick",EventData.value )
      `
    }
  }
];
