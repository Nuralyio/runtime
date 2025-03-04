import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../helper/common_attributes.ts";

export default [
  {
    uuid: "cursor_block",
    application_id: "1",
    name: "Position Block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between",
      "width": "276px"
    },
    childrenIds: ["cursor_label", "cursor_select", "cursor_handler"]
  },
  {
    uuid: "cursor_label",
    application_id: "1",
    name: "Position Label",
    component_type: ComponentType.TextLabel,
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "string",
        value: "Cursor"
      }
    },
    style: {
      width: "90px"
    }
  },
  {
    uuid: "cursor_select",
    application_id: "1",
    name: "Position Select",
    component_type: ComponentType.Select,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    input: {
      value: {
        type: "handler",
        value: /* js */ `
          const selectedComponent = Utils.first(Editor.selectedComponents);
          let currentPosition = "";
          let isDisabled = false;

          if (selectedComponent?.styleHandlers?.position) {
            isDisabled = true;
          } else {
            currentPosition = selectedComponent?.style?.['cursor'] || 'auto';
          }

          const options = [
            { label: "Pointer", value: "auto", disabled: isDisabled },
            { label: "Hand", value: "pointer", disabled: isDisabled },
          ];

          return [options, [currentPosition || ""]];
        `
      }
    },
    style: {
      display: "block",
      "--hybrid-select-width": "150px",
      "size": "small"
    },
    event: {
      changed: /* js */ `
        try {
          const selectedComponent = Utils.first(Editor.selectedComponents);
          const positionValue = EventData.value;
          updateStyle(selectedComponent, 'cursor', positionValue);
        } catch (error) {
          console.log(error);
        }
      `
    }
  },
  {
    uuid: "cursor_handler",
    application_id: "1",
    name: "Position Handler",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    style: {
      display: "block",
      width: "250px"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */ `
          const parameter = 'position';
          let positionHandler = '';
          
          try {
            const selectedComponent = Utils.first(Editor.selectedComponents);
            positionHandler = selectedComponent?.styleHandlers?.['cursor'] || '';
          } catch (error) {
            console.log(error);
          }

          return [parameter, positionHandler];
        `
      }
    },
    event: {
      codeChange: /* js */ `
        try {
          const selectedComponent = Utils.first(Editor.selectedComponents);
          updateStyleHandlers(selectedComponent, 'cursor', EventData.value);
        } catch (error) {
          console.log(error);
        }
      `
    }
  }
];