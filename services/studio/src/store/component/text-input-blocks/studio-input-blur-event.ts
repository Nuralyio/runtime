import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
        uuid: "input_blur_event_block",
        applicationId: "1",
        name: "Input blur event",
        component_type: ComponentType.VerticalContainer,
        styleHandlers: {},
        ...COMMON_ATTRIBUTES,
        style: {
            width: "220px",
            'margin-top': '10px',
            display:'flex',
            'justify-content':'space-between',
        },
        
        childrenIds: ["text_label_input_blur_event", "input_blur_event_value"],
    },
    {
        uuid: "text_label_input_blur_event",
        name: "text_label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                type: 'handler',
                value: /* js */`
               const label ='Blur';
               label;
            `
            }
        }
    },
    {
        uuid: "input_blur_event_value",
        applicationId: "1",
        component_type: ComponentType.Event,
        ...COMMON_ATTRIBUTES,
        input: { 
            value: {
                type: 'handler',
                value: /* js */`
                const event ='blur';
                event;
            `
            }
        },
        styleHandlers: {},
        name: "input blur event value",
        style: {
                display:'block',
                width: "250px", 
        },
        
    },
] 
