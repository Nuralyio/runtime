import { createHandlersFromEvents } from "../../utils/handler-generator.ts";

export const StudioSelectHandler = createHandlersFromEvents
([
  {
    name: "changed",
    label: "onChanged"
  }
], "studio_select_handler");
