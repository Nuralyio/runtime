import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../../helper/common_attributes.ts";
import { InputBlockContainerTheme, SelectTheme } from "../../../utils/common-editor-theme.ts";

export const StudioInputAlignmentDirection = [
  {
    uuid: "container_alignment_block",
    application_id: "1",
    name: "button type block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      ...InputBlockContainerTheme
    },
    childrenIds: ["container_alignment_radio_block", "container_alignment_handler_block"]
  },
  {
    uuid: "container_alignment_radio_block",
    application_id: "1",
    name: "placeholder block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between"
    },
    childrenIds: ["container_alignment_label"]
  },
  {
    uuid: "container_alignment_label",
    name: "button type label",
    component_type: ComponentType.TextLabel,
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "handler",
        value: /* js */ `
          const typeLabel = 'Alignment';
          return typeLabel;
        `
      }
    },
    style: {
      width: "90px",
    }
  },
  {
    uuid: "container_alignment_select",
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
          const currentType = Editor.getComponentStyle(Utils.first(Editor.selectedComponents), 'justify-content') ?? "default";

          const options = [
            { label: "flex-start", value: "flex-start" },
            { label: "flex-end", value: "flex-end" },
            { label: "center", value: "center" },
          ];

          return [options, [[currentType]]];
        `
      },
      state: {
        type: "handler",
        value: /* js */ `
          const selectedComponent = Utils.first(Editor.selectedComponents);
          let isDisabled = 'enabled';
          if (selectedComponent?.styleHandlers?.['justify-content']) {
            isDisabled = 'disabled';
          }
          return isDisabled;
        `
      }
    },
    style: {
      display: "block",
      ...SelectTheme
    },
    event: {
      changed: /* js */ `
        const selectedComponent = Utils.first(Editor.selectedComponents);
        const typeValue = EventData.value || 'default';
        updateStyle(selectedComponent, 'justify-content', typeValue);
      `
    }
  },
  {
    uuid: "container_alignment_handler_block",
    application_id: "1",
    name: "button type handler block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "justify-content": "space-between",
      "align-items": "center"
    },
    childrenIds: ["container_alignment_select", "container_alignment_handler"]
  },
  {
    uuid: "container_alignment_handler",
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
        value: /* js */ `
          const parameter = 'justify-content';
          let typeHandler = '';
          const selectedComponent = Utils.first(Editor.selectedComponents);
          typeHandler = selectedComponent?.styleHandlers?.['justify-content'] || '';
          return [parameter, typeHandler];
        `
      }
    },
    event: {
      codeChange: /* js */ `
        const selectedComponent = Utils.first(Editor.selectedComponents);
        updateStyleHandlers(selectedComponent, 'justify-content', EventData.value);
      `
    }
  }
];