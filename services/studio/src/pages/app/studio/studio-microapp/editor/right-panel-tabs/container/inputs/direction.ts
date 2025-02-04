import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../../helper/common_attributes.ts";
import { InputBlockContainerTheme, SelectTheme } from "../../../utils/common-editor-theme.ts";

export const StudioContainerInputDirection = [
  {
    uuid: "table_direction_block",
    application_id: "1",
    name: "button type block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      ...InputBlockContainerTheme
    },
    childrenIds: ["table_direction_radio_block", "table_direction_handler_block"]
  },
  {
    uuid: "table_direction_radio_block",
    application_id: "1",
    name: "placeholder block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between"
    },
    childrenIds: ["table_direction_label"]
  },
  {
    uuid: "table_direction_label",
    name: "button type label",
    component_type: ComponentType.TextLabel,
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "handler",
        value: /* js */`
                const typeLabel = 'Type';
                return typeLabel;
                `
      }
    },
    style: {
      width: "90px",
    }
  },
  {
    uuid: "table_direction_select",
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
              const options = [
                { label: "vertical", value: "vertical" },
                { label: "horizontal", value: "horizontal" },
              ];
              return [options, [[
                Utils.first(Editor.selectedComponents)?.input?.direction?.value ?? "default"
              ]]];
                `
      },
      state: {
        type: "handler",
        value: /* js */`
                const selectedComponent = Utils.first(Editor.selectedComponents);
                let isDisabled = 'enabled';
                if (selectedComponent?.input?.direction?.type === 'handler' &&
                  selectedComponent?.input?.direction?.value ) {
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
              updateInput(selectedComponent, "direction", 'string',typeValue);
            `
    }
  },
  {
    uuid: "table_direction_handler_block",
    application_id: "1",
    name: "button type handler block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "justify-content": "space-between",
      "align-items": "center"
    },
    childrenIds: ["table_direction_select", "table_direction_handler"]
  },
  {
    uuid: "table_direction_handler",
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
                const handlerValue = selectedComponent?.input?.direction?.type === 'handler'
                ? selectedComponent.input.direction.value
                : '';
                return ['direction', handlerValue];
                `
      }
    },
    event: {
      codeChange: /* js */ `

      const selectedComponent = Utils.first(Editor.selectedComponents);
        if (selectedComponent && EventData.value !== selectedComponent?.input?.direction?.value) {
          updateInput(selectedComponent, 'direction', 'handler', EventData.value);
        }
            `
    }
  }
];