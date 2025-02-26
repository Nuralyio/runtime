import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../../helper/common_attributes.ts";
import { InputBlockContainerTheme, SelectTheme } from "../../../utils/common-editor-theme.ts";

export const StudioContainerInputLayout = [
  {
    uuid: "container_layout_block",
    application_id: "1",
    name: "button type block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      ...InputBlockContainerTheme
    },
    childrenIds: ["container_layout_radio_block", "container_layout_handler_block"]
  },
  {
    uuid: "container_layout_radio_block",
    application_id: "1",
    name: "placeholder block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between"
    },
    childrenIds: ["container_layout_label"]
  },
  {
    uuid: "container_layout_label",
    name: "button type label",
    component_type: ComponentType.TextLabel,
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "handler",
        value: /* js */`
                const typeLabel = 'Layout';
                return typeLabel;
                `
      }
    },
    style: {
      width: "90px",
    }
  },
  {
    uuid: "container_layout_select",
    application_id: "1",
    component_type: ComponentType.Select,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "button type select",
    input: {
      placeholder: {
        type: "string",
        value: 'layout'
      },
      value: {
        type: "handler",
        value: /* js */ `
              const options = [
                { label: "Default", value: "default" },
                { label: "Boxed", value: "boxed" },
              ];
              return [options, [[
                Utils.first(Editor.selectedComponents)?.input?.layout?.value ?? "default"
              ]]];
                `
      },
      state: {
        type: "handler",
        value: /* js */`
                const selectedComponent = Utils.first(Editor.selectedComponents);
                let isDisabled = 'enabled';
                if (selectedComponent?.input?.layout?.type === 'handler' &&
                  selectedComponent?.input?.layout?.value ) {
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
              updateInput(selectedComponent, "layout", 'string',typeValue);
            `
    }
  },
  {
    uuid: "container_layout_handler_block",
    application_id: "1",
    name: "button type handler block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "justify-content": "space-between",
      "align-items": "center"
    },
    childrenIds: ["container_layout_select", "container_layout_handler"]
  },
  {
    uuid: "container_layout_handler",
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
                const selectedComponent = Utils.first(Editor.selectedComponents);
                const handlerValue = selectedComponent?.input?.layout?.type === 'handler'
                ? selectedComponent?.input?.layout.value
                : '';
                return ['layout', handlerValue];
                `
      }
    },
    event: {
      codeChange: /* js */ `

      const selectedComponent = Utils.first(Editor.selectedComponents);
        if (selectedComponent && EventData.value !== selectedComponent?.input?.layout?.value) {
          updateInput(selectedComponent, 'layout', 'handler', EventData.value);
        }
            `
    }
  }
];