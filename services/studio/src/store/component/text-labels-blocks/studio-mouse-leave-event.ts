import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
        uuid: "mouse_leave_event_block",
        applicationId: "1",
        name: "Left panel",
        component_type: ComponentType.VerticalContainer,
        styleHandlers: {},
        ...COMMON_ATTRIBUTES,
        style: {
            width: "220px",
            'margin-top': '10px',
            display:'flex',
            'justify-content':'space-between',
        },
        
        childrenIds: ["text_label_mouse_leave_event", "mouse_leave_event_value"],
    },
    {
        uuid: "text_label_mouse_leave_event",
        name: "text_label",
        component_type: ComponentType.TextLabel,
        parameters: {
            value: "Mouseleave",
        },

        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        style:{display:true}
    },
    {
        uuid: "mouse_leave_event_value",
        applicationId: "1",
        component_type: ComponentType.Event,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "Left panel",
        style: {
                display:'block',
                width: "250px", 
        },
        input: { 
            value: {
                type: 'handler',
                value: /* js */`
                const event ='mouseleave';
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        if(!currentComponent.event){
                            currentComponent= {...currentComponent,event:{mouseLeave:{}}}
                        }
                    }
                }catch(error){
                    console.log(error);
                }
                event;
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
                    updateEvent(currentComponent, "mouseLeave",EventData.value )
                }
            }catch(error){
                console.log(error);
            }
      `
        },
    },
] 
