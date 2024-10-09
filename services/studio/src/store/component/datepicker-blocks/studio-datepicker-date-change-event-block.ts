import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";

export default [
    {
        uuid: "datepicker_date_change_event_block",
        applicationId: "1",
        name: "Datepicker date change event",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "220px",
            'margin-top': '10px',
            display:'flex',
            'justify-content':'space-between',
        },
        
        childrenIds: ["text_label_datepicker_date_change_event", "datepicker_date__change_event_value"],
    },
    {
        uuid: "text_label_datepicker_date_change_event",
        name: "text label datepicker date change event",
        component_type: ComponentType.TextLabel,
        
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                type: 'handler',
                value: /* js */`
               const label ='Date change';
             return label;
            `
            }
        },
    },
    {
        uuid: "datepicker_date__change_event_value",
        applicationId: "1",
        component_type: ComponentType.Event,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "datepicker date change event value",
        style: {
                display:'block',
                width: "250px", 
        },
        input: { 
            value: {
                type: 'handler',
                value: /* js */`
                const event ='date-change';
                let currentEventValue =''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        if(currentComponent.event?.dateChange){
                            currentEventValue= currentComponent.event.dateChange;
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
                    updateEvent(currentComponent, "dateChange",EventData.value )
                }
            }catch(error){
                console.log(error);
            }
      `
        },
    },
] 
