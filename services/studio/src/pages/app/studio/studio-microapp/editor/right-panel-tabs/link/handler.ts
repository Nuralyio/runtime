import { createHandlersFromEvents } from "../../utils/handler-generator.ts";

export const StudioLinkHandler = createHandlersFromEvents
([
{
    name : "onClick",
    label : "onClick",
}
], "studio_link_handler");