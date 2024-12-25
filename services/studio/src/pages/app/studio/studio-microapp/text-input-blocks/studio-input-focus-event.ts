import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";

export default [
  {
    uuid: "input_focus_event_block",
    applicationId: "1",
    name: "Input focus event",
    component_type: ComponentType.VerticalContainer,
    styleHandlers: {},
    ...COMMON_ATTRIBUTES,
    style: {

      "margin-top": "10px",
      display: "flex",
      "justify-content": "space-between",
      "align-items": "center"
    },

    childrenIds: ["text_label_input_focus_event", "input_focus_event_value"]
  },
  {
    uuid: "text_label_input_focus_event",
    name: "text_label",
    component_type: ComponentType.TextLabel,

    applicationId: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "handler",
        value: /* js */`
               const label ='Focus';
             return label;
            `
      }
    }
  },
  {
    uuid: "input_focus_event_value",
    applicationId: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "input focus event value",
    style: {
      display: "block",
      width: "250px"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
                const event ='focus';
                let currentEventValue =''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        if(currentComponent.event?.focus){
                            currentEventValue= currentComponent.event.focus;
                        } 
                    }
                }catch(error){
                    console.log(error);
                }
                [event,currentEventValue];
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
                    updateEvent(currentComponent, "focus",EventData.value )
                }
            }catch(error){
                console.log(error);
            }
      `
    }
  }
];
