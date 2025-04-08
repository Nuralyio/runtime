import { createHandlersFromEvents } from "../../utils/handler-generator.ts";

export const StudioMenuHandler = createHandlersFromEvents
([
    {
        name : "onSelect",
        label : "onSelect"
    }

], "studio_menu_handler");