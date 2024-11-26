import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";

export default [
    {
        uuid: "select_changed_event_block",
        applicationId: "1",
        name: "Select changed event block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "310px",
            'margin-top': '10px',
            display:'flex',
            'justify-content':'space-between',
            'align-items':'center'
        },
        
        childrenIds: ["text_label_select_changed_event_block", "select_changed_event_value"],
    },
    {
        uuid: "text_label_select_changed_event_block",
        name: "text label select changed event block",
        component_type: ComponentType.TextLabel,
        
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                type: 'handler',
                value: /* js */`
               const label ='Change';
             return label;
            `
            }
        },
    },
    {
        uuid: "select_changed_event_value",
        applicationId: "1",
        component_type: ComponentType.Event,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "select changed event value",
        style: {
                display:'block',
                width: "250px", 
        },
        input: { 
            value: {
                type: 'handler',
                value: /* js */`
                const event ='changed';
                let currentEventValue =''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if(selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        if(currentComponent.event?.changed){
                            currentEventValue= currentComponent.event.changed;
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
                    updateEvent(currentComponent, "changed",EventData.value )
                }
            }catch(error){
                console.log(error);
            }
      `
        },
    },
] 
