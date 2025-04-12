import { createHandlersFromEvents } from "../../utils/handler-generator.ts";

export const StudioEmbedHandler = createHandlersFromEvents
([
{
    name : "onItemClicked",
    label : "onItemClicked",
}
], "studio_embed_handler");