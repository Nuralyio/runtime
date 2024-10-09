import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";

export default [
    {
        uuid: "button_click_event_block",
        applicationId: "1",
        name: "Button click event",
        component_type: ComponentType.VerticalContainer,
        styleHandlers: {},
        ...COMMON_ATTRIBUTES,
        style: {
            width: "220px",
            'margin-top': '10px',
            display:'flex',
            'justify-content':'space-between',
        },
        
        childrenIds: ["text_label_button_click_event", "button_click_event_value"],
    },
    {
        uuid: "text_label_button_click_event",
        name: "text_label",
        component_type: ComponentType.TextLabel,
        
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                type: 'handler',
                value: /* js */`
               const label ='Click';
             return label;
            `
            }
        },
    },
    {
        uuid: "button_click_event_value",
        applicationId: "1",
        component_type: ComponentType.Event,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "button click event value",
        style: {
                display:'block',
                width: "250px", 
        },
        input: { 
            value: {
                type: 'handler',
                value: /* js */`
                const event ='onClick';
                let currentEventValue =''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        if(currentComponent.event?.onClick){
                            currentEventValue= currentComponent.event.onClick;
                        } 
                    }
                }catch(error){
                    console.log(error);
                }
                return [event,currentEventValue];
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
        },
    },
] 
