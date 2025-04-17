import { createHandlersFromEvents } from "../../utils/handler-generator.ts";

export const StudioDropdownHandler = createHandlersFromEvents
([
{
    name : "onItemClicked",
    label : "onItemClicked",
}
], "studio_dropdown_handler");