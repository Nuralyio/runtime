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
            "width":"380px"
        },

        childrenIds: ["font_color_block", "font_family_block", "ask-ai"],
    },
    {
        uuid: "ask-ai",
        name: "name",
        applicationId: "1",
        component_type: ComponentType.AI,
    }
]