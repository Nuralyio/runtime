import { COMMON_ATTRIBUTES } from "../helpers/common_attributes.ts";
import { InputBlockContainerTheme, SelectTheme } from "../utils/common-editor-theme.ts";

export const StudioInnerContainerInputAlignment = [
  {
    uuid: "inner_container_alignement_block",
    application_id: "1",
    name: "button type block",
    type: "container",
    ...COMMON_ATTRIBUTES,
    style: {
      ...InputBlockContainerTheme
    },
    children_ids: ["inner_container_radio_block", "inner_container_handler_block"]
  },
  {
    uuid: "inner_container_radio_block",
    application_id: "1",
    name: "placeholder block",
    type: "container",
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between"
    },
    children_ids: ["inner_container_label"]
  },
  {
    uuid: "inner_container_label",
    name: "button type label",
    type: "text_label",
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "string",
        value: 'Inner Container alignment'
      }
    },
    style: {
      width: "90px",
    }
  },
  {
    uuid: "inner_container_select",
    application_id: "1",
    type: "select",
    ...COMMON_ATTRIBUTES,
    style_handlers: {},
    name: "button type select",
    input: {
      placeholder: {
        type: "string",
        value: 'Direction'
      },
      value: {
        type: "handler",
        value: /* js */ `
          const selectedComponent = Utils.first($selectedComponents);
          const currentType = Editor.getComponentStyle(Utils.first($selectedComponents), 'innerAlignment') || 'start';
          const options = [
            { label: "Start", value: "start" },
            { label: "Middle", value: "middle" },
            { label: "End", value: "end" },
          ];
          return [options, [currentType]];
        `
      },
      state: {
        type: "handler",
        value: /* js */`
          const selectedComponent = Utils.first($selectedComponents);
          return selectedComponent?.style_handlers?.innerAlignment 
            ? 'disabled' 
            : 'enabled';
        `
      }
    },
    style: {
      ...SelectTheme
    },
    event: {
      changed: /* js */ `
        const selectedComponent = Utils.first($selectedComponents);
          const typeValue = EventData.value || 'start';
          updateInput(selectedComponent, "innerAlignment", 'string', typeValue);
      `
    }
  },
  {
    uuid: "inner_container_handler_block",
    application_id: "1",
    name: "button type handler block",
    type: "container",
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "justify-content": "space-between",
      "align-items": "center"
    },
    children_ids: ["inner_container_select", "inner_container_handler"]
  },
  {
    uuid: "inner_container_handler",
    application_id: "1",
    type: "event",
    ...COMMON_ATTRIBUTES,
    style_handlers: {},
    name: "type handler",
    style: {
      display: "block",
      "--nuraly-button-width": "120px"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
          const parameter = 'innerAlignment';
          const selectedComponent = Utils.first($selectedComponents);
          const handlerValue = selectedComponent?.style_handlers?.innerAlignment || '';
          return [parameter, handlerValue];
        `
      }
    },
    event: {
      codeChange: /* js */ `
        const selectedComponent = Utils.first($selectedComponents);
        if (selectedComponent) {
          updateStyleHandlers(selectedComponent, 'innerAlignment', EventData.value);
        }
      `
    }
  }
];