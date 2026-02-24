import { COMMON_ATTRIBUTES } from "../../core/helpers/common_attributes";

import inputs from "./pages-bg-color";
import inputsDark from "./pages-bg-color-dark";


export const PageThemeStudio = [
    {
        uuid: "PageThemeStudio",
        application_id: "1",
        name: "PageThemeStudio",
        type: "container",
        ...COMMON_ATTRIBUTES,
        style: {
            display: "flex",
            "flex-direction": "column"
        },
        children_ids: ["page_bg_color_theme_block", "page_bg-dark_color_theme_block"]
    },
    ...inputs,
    ...inputsDark
]