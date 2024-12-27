import { createHandlersFromEvents } from "../../utils/handler-generator.ts";

export const StudioDateHandler = createHandlersFromEvents
([
  {
    name: "onDateChange",
    label: "dateChange"
  }
], "studio_datepicker_handler");
