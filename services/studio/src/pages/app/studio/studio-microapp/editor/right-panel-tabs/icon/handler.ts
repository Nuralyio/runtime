import { createHandlersFromEvents } from "../../utils/handler-generator.ts";

export const StudioIconHandler = createHandlersFromEvents
  ([
    {
      name: "onInit",
      label: "onInit"
    },
    {
      name: "onClick",
      label: "onClick"
    },
  ], "studio_icon_handler");
