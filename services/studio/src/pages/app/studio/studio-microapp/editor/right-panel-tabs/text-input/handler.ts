import { createHandlersFromEvents } from "../../utils/handler-generator.ts";

export const StudioTextInputHandler = createHandlersFromEvents
([
  {
    name: "focus",
    label: "onFocus"
  },
  {
    name: "valueChange",
    label: "onChanged"
  },{
    name: "blur",
    label: "onBlur"
  },{
  name : "clear",
  label : "onClear"
  }
], "studio_text_input_handler");
