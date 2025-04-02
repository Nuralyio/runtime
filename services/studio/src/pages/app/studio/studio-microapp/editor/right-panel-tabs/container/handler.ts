
import { createHandlersFromEvents } from "../../utils/handler-generator.ts";

export const StudioContainerHandler = createHandlersFromEvents
([
    {
        name: "onClick",
        label: "onClick"
      },
      {
        name: "onMouseEnter",
        label: "onMouseEnter"
      },
      {
        name: "onMouseLeave",
        label: "onMouseLeave"
      }
], "studio_container_handler");
