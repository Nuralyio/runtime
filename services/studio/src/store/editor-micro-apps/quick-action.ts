import { COMMON_ATTRIBUTES } from "$store/component/helper/common_attributes";
import { ComponentType } from "$store/component/interface";

export default [
    {
        uuid: "quick-action-wrapper",
        applicationId: "1",
        name: "helper text block",
        component_type: ComponentType.VerticalContainer,
        styleHandlers: {},
        input: {
            direction: "horizontal",
        },
        ...COMMON_ATTRIBUTES,
        style: {
            display: 'flex',
        },

        childrenIds: ["font_color_block", "font_family_block", "ask-ai-button"],
    },
    {
        uuid: "ask-ai-button",
        name: "name",
        applicationId: "1",
        component_type: ComponentType.Button,
        styleHandlers: {},
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                type: 'handler',
                value: /* js */`
                const label ='Ask AI';
                label;
                `
            }
        }
    }


]