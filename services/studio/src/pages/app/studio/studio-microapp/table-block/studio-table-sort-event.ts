import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";
export default [
    {
        uuid: "table_sort_event_block",
        applicationId: "1",
        name: "Left panel",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            
            'margin-top': '10px',
            display:'flex',
            'justify-content':'space-between',
            'align-items':'center'
        },
        
        childrenIds: ["text_label_sort_event", "sort_event_value"],
    },
    {
        uuid: "text_label_sort_event",
        name: "text_label",
        component_type: ComponentType.TextLabel,
        
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                type: 'handler',
                value: /* js */`
               const label ='onSort';
               return label;
            `
            }
        },
        style:{
            display:true
        }
    },
    {
        uuid: "sort_event_value",
        applicationId: "1",
        component_type: ComponentType.Event,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "sort event value",
        style: {
                display:'block',
                width: "250px", 
        },
        input: { 
            value: {
                type: 'handler',
                value: /* js */`
                const event ='onSort';
                let eventValue = ''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        eventValue = currentComponent?.event?.onSort ??''
                        
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
                    updateEvent(currentComponent, "onSort",EventData.value )
                }
            }catch(error){
                console.log(error);
            }
      `
        },
    },
] 
