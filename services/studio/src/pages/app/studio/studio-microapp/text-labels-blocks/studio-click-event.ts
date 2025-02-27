import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";

export default [
  {
    uuid: "click_event_block",
    application_id: "1",
    name: "Left panel",
    component_type: ComponentType.Container,
    styleHandlers: {},
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between",
      "width": "276px"
    },
    childrenIds: ["text_label_click_event", "click_event_value"]
  },
  {
    uuid: "text_label_click_event",
    name: "text_label",
    component_type: ComponentType.TextLabel,

    application_id: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "handler",
        value: /* js */`
                     return 'Click event';
                    `
      }
    },
    style: {
      display: true
    }
  },
  {
    uuid: "click_event_value",
    application_id: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "label click event value",
    style: {
      display: "block"
    },
    input: {
      triggerText: {
        type: "string",
        value: /* js */`Set click event handler `
      },
      value: {
        type: "handler",
        value: /* js */`
                const event ='onClick';
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        if(!currentComponent.event){
                            currentComponent= {...currentComponent,event:{onClick:{}}}
                        }
                    }
                }catch(error){
                    console.log(error);
                }
                return event;
            `
      }
    },
    event: {
      codeChange: /* js */ `
            try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    updateEvent(currentComponent, "onClick",EventData.value )
                }
            }catch(error){
                console.log(error);
            }
      `
    }
  }
];
