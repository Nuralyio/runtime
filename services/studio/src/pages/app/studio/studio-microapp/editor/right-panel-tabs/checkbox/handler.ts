import { createHandlersFromEvents } from "../../utils/handler-generator.ts";

export const StudioCheckboxHandler = createHandlersFromEvents
([
  {
    name: "checkboxChanged",
    label: "checkboxChanged"
  }
], "studio_checkbox_handler");
