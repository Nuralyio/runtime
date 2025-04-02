import { ComponentType } from "$store/component/interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";

import inputs from  "./pages-bg-color";


export const PageThemeStudio = [
    {
        uuid: "PageThemeStudio",
        application_id: "1",
        name: "PageThemeStudio",
        component_type: ComponentType.Container,
        ...COMMON_ATTRIBUTES,
        style: {
            display: "flex",
            "flex-direction": "column"
        },
        childrenIds: ["page_bg_color_theme_block"]
    },
    ...inputs
]