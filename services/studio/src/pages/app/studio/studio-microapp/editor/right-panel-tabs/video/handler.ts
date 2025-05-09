import { createHandlersFromEvents } from "../../utils/handler-generator.ts";

export const StudioTextLabelHandler = createHandlersFromEvents
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
  },
  {
    name: "onDoubleClick",
    label: "onDoubleClick"
  }
], "text_label_handler");
