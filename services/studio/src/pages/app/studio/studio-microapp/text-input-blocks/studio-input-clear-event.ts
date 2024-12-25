import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";

export default [
  {
    uuid: "input_clear_event_block",
    applicationId: "1",
    name: "Input clear event",
    component_type: ComponentType.VerticalContainer,
    ...COMMON_ATTRIBUTES,
    style: {
      width: "322px",
      "margin-top": "10px",
      display: "flex",
      "justify-content": "space-between",
      "align-items": "center"

    },

    childrenIds: ["text_label_input_clear_event", "input_clear_event_value"]
  },
  {
    uuid: "text_label_input_clear_event",
    name: "text_label",
    component_type: ComponentType.TextLabel,
    applicationId: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "handler",
        value: /* js */`
                const event ='Clear';
                event;
            `
      }
    }
  },
  {
    uuid: "input_clear_event_value",
    applicationId: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "input clear event value",
    style: {
      display: "block",
      width: "250px"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
                const event ='clear';
                event;
            `
      }
    }
  }
];
