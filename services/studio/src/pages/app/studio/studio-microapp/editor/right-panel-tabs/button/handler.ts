import { createHandlersFromEvents } from "../../utils/handler-generator.ts";

export const StudioButtonHandler = createHandlersFromEvents
([
  {
    name: "onClick",
    label: "onClick"
  }
], "studio_button_handler");
