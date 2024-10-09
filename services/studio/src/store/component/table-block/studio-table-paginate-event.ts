import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
        uuid: "table_paginate_event_block",
        applicationId: "1",
        name: "Left panel",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "220px",
            'margin-top': '10px',
            display:'flex',
            'justify-content':'space-between',
        },
        
        childrenIds: ["text_label_paginate_event", "paginate_event_value"],
    },
    {
        uuid: "text_label_paginate_event",
        name: "text_label",
        component_type: ComponentType.TextLabel,
        
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                type: 'handler',
                value: /* js */`
               const label ='onPaginate';
               return label;
            `
            }
        },
        style:{
            display:true
        }
    },
    {
        uuid: "paginate_event_value",
        applicationId: "1",
        component_type: ComponentType.Event,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "paginate event value",
        style: {
                display:'block',
                width: "250px", 
        },
        input: { 
            value: {
                type: 'handler',
                value: /* js */`
                const event ='onPaginate';
                let eventValue = ''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        eventValue = currentComponent?.event?.onPaginate ??''
                        
                    }
                }catch(error){
                    console.log(error);
                }
                return [event,eventValue]
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
                    updateEvent(currentComponent, "onPaginate",EventData.value )
                }
            }catch(error){
                console.log(error);
            }
      `
        },
    },
] 
