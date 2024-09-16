import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";

export default [
    {
        uuid: "checkbox_changed_event_block",
        applicationId: "1",
        name: "Checkbox changed event block",
        component_type: ComponentType.VerticalContainer,
        styleHandlers: {},
        ...COMMON_ATTRIBUTES,
        style: {
            width: "220px",
            'margin-top': '10px',
            display:'flex',
            'justify-content':'space-between',
        },
        
        childrenIds: ["text_label_checkbox_changed_event_block", "checkbox_changed_event_value"],
    },
    {
        uuid: "text_label_checkbox_changed_event_block",
        name: "text label checkbox changed event block",
        component_type: ComponentType.TextLabel,
        
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                type: 'handler',
                value: /* js */`
               const label ='Checkbox change';
             return label;
            `
            }
        },
    },
    {
        uuid: "checkbox_changed_event_value",
        applicationId: "1",
        component_type: ComponentType.Event,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "checkbox changed event value",
        style: {
                display:'block',
                width: "250px", 
        },
        input: { 
            value: {
                type: 'handler',
                value: /* js */`
                const event ='checkbox-changed';
                let currentEventValue =''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        if(currentComponent.event?.checkboxChanged){
                            currentEventValue= currentComponent.event.checkboxChanged;
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
                    updateEvent(currentComponent, "checkboxChanged",EventData.value )
                }
            }catch(error){
                console.log(error);
            }
      `
        },
    },
] 
