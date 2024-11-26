import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";
export default [
    {
        uuid: "table_select_event_block",
        applicationId: "1",
        name: "Left panel",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "310px",
            'margin-top': '10px',
            display:'flex',
            'justify-content':'space-between',
            'align-items':'center'

        },
        
        childrenIds: ["text_label_select_event", "select_event_value"],
    },
    {
        uuid: "text_label_select_event",
        name: "text_label",
        component_type: ComponentType.TextLabel,
        
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                type: 'handler',
                value: /* js */`
               const label ='onSelect';
               return label;
            `
            }
        },
        style:{
            display:true
        }
    },
    {
        uuid: "select_event_value",
        applicationId: "1",
        component_type: ComponentType.Event,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "select event value",
        style: {
                display:'block',
                width: "250px", 
        },
        input: { 
            value: {
                type: 'handler',
                value: /* js */`
                const event ='onSelect';
                let eventValue = ''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        eventValue = currentComponent?.event?.onSelect ??''
                        
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
                    updateEvent(currentComponent, "onSelect",EventData.value )
                }
            }catch(error){
                console.log(error);
            }
      `
        },
    },
] 
