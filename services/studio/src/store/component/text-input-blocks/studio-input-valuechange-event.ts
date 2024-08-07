import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";

export default [
    {
        uuid: "input_valuechange_event_block",
        applicationId: "1",
        name: "Input valuechange event",
        component_type: ComponentType.VerticalContainer,
        styleHandlers: {},
        ...COMMON_ATTRIBUTES,
        style: {
            width: "220px",
            'margin-top': '10px',
            display:'flex',
            'justify-content':'space-between',
        },
        
        childrenIds: ["text_label_input_valuechange_event", "input_valuechange_event_value"],
    },
    {
        uuid: "text_label_input_valuechange_event",
        name: "text_label",
        component_type: ComponentType.TextLabel,
        parameters: {
            value: "vlauechange",
        },

        applicationId: "1",
        ...COMMON_ATTRIBUTES,
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
                event;
            `
            }
        },
    },
] 
