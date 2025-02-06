
import { createHandlersFromEvents } from "../../utils/handler-generator.ts";

export const StudioContainerHandler = createHandlersFromEvents
([
    {
        name: "onClick",
        label: "onClick"
      },
], "studio_container_handler");
