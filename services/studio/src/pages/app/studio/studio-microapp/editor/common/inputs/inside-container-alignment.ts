import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../helper/common_attributes.ts";
import { InputBlockContainerTheme, SelectTheme } from "../../utils/common-editor-theme.ts";

export const StudioInnerContainerInputAlignment = [
  {
    uuid: "inner_container_alignement_block",
    application_id: "1",
    name: "button type block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      ...InputBlockContainerTheme
    },
    childrenIds: ["inner_container_radio_block", "inner_container_handler_block"]
  },
  {
    uuid: "inner_container_radio_block",
    application_id: "1",
    name: "placeholder block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between"
    },
    childrenIds: ["inner_container_label"]
  },
  {
    uuid: "inner_container_label",
    name: "button type label",
    component_type: ComponentType.TextLabel,
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
    component_type: ComponentType.Select,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "button type select",
    input: {
      placeholder: {
        type: "string",
        value: 'Direction'
      },
      value: {
        type: "handler",
        value: /* js */ `
          const selectedComponent = Utils.first(Editor.selectedComponents);
          const currentType = Editor.getComponentStyle(Utils.first(Editor.selectedComponents), 'innerAlignment') || 'start';
          const options = [
            { label: "Start", value: "start" },
            { label: "End", value: "end" },
          ];
          return [options, [currentType]];
        `
      },
      state: {
        type: "handler",
        value: /* js */`
          const selectedComponent = Utils.first(Editor.selectedComponents);
          return selectedComponent?.styleHandlers?.innerAlignment 
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
        const selectedComponent = Utils.first(Editor.selectedComponents);
          const typeValue = EventData.value || 'start';
          updateInput(selectedComponent, "innerAlignment", 'string', typeValue);
      `
    }
  },
  {
    uuid: "inner_container_handler_block",
    application_id: "1",
    name: "button type handler block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "justify-content": "space-between",
      "align-items": "center"
    },
    childrenIds: ["inner_container_select", "inner_container_handler"]
  },
  {
    uuid: "inner_container_handler",
    application_id: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "type handler",
    style: {
      display: "block",
      "--hybrid-button-width": "120px"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
          const parameter = 'innerAlignment';
          const selectedComponent = Utils.first(Editor.selectedComponents);
          const handlerValue = selectedComponent?.styleHandlers?.innerAlignment || '';
          return [parameter, handlerValue];
        `
      }
    },
    event: {
      codeChange: /* js */ `
        const selectedComponent = Utils.first(Editor.selectedComponents);
        if (selectedComponent) {
          updateStyleHandlers(selectedComponent, 'innerAlignment', EventData.value);
        }
      `
    }
  }
];