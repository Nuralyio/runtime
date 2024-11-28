import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";

export default [
    {
        uuid: "input_valuechange_event_block",
        applicationId: "1",
        name: "Input valuechange event",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            
            'margin-top': '10px',
            display:'flex',
            'justify-content':'space-between',
            'align-items':'center'
        },
        
        childrenIds: ["text_label_input_valuechange_event", "input_valuechange_event_value"],
    },
    {
        uuid: "text_label_input_valuechange_event",
        name: "text_label",
        component_type: ComponentType.TextLabel,
        
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                type: 'handler',
                value: /* js */`
               const label ='Value change';
             return label;
            `
            }
        },
    },
    {
        uuid: "input_valuechange_event_value",
        applicationId: "1",
        component_type: ComponentType.Event,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "input valuechange event value",
        style: {
                display:'block',
                width: "250px", 
        },
        input: { 
            value: {
                type: 'handler',
                value: /* js */`
                const event ='valueChange';
                let currentEventValue =''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        if(currentComponent.event?.valueChange){
                            currentEventValue= currentComponent.event.valueChange;
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
                    updateEvent(currentComponent, "valueChange",EventData.value)
                }
            }catch(error){
                console.log(error);
            }
      `
        },
    },
] 
