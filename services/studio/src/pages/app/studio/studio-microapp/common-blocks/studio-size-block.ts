import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";
import { RadioButtonWithThreeOptionsTheme } from "../editor/utils/common-editor-theme.ts";

export default [
  {
    uuid: "size_block",
    application_id: "1",
    name: "size block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between",
      "width": "290px",
    },
    childrenIds: ["size_radio_block", "size_handler_block"],
  },
  {
    uuid: "size_radio_block",
    application_id: "1",
    name: "placeholder block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between",
    },
    childrenIds: ["size_label"],
  },
  {
    uuid: "size_label",
    name: "size label",
    component_type: ComponentType.TextLabel,
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "string",
        value: "Size",
      },
    },
    style: {
      width: "90px",
      marginLeft: "5px",
    },
  },
  {
    uuid: "size_radio",
    application_id: "1",
    component_type: ComponentType.RadioButton,
    name: "size select",
    input: {
      value: {
        type: "handler",
        value: /* js */ `
          const selectedComponent = Utils.first(Editor.selectedComponents);
          let isDisabled = false;
          let currentSize = '';
          if (selectedComponent.styleHandlers && selectedComponent?.styleHandlers?.size) {
            isDisabled = true;
          } else {
            currentSize = Editor.getComponentStyle(selectedComponent, 'size') || 'medium';
          }
          const options = [
            {
              label: 'Small',
              value: "small",
              disabled: isDisabled,
            },
            {
              label: 'Medium',
              value: "medium",
              disabled: isDisabled,
            },
            {
              label: 'Large',
              value: "large",
              disabled: isDisabled,
            }
          ];   
          const radioType = 'button';
          const result = [options, currentSize, radioType];
          return result;
        `,
      },
    },
    style: {
      ...RadioButtonWithThreeOptionsTheme,
    },
    event: {
      changed: /* js */ `
        updateStyle(Utils.first(Editor.selectedComponents), 'size', EventData.value);
      `,
    },
  },
  {
    uuid: "size_handler_block",
    application_id: "1",
    name: "status handler block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "justify-content": "space-between",
      "align-items": "center",
    },
    childrenIds: ["size_radio", "size_handler"],
  },
  {
    uuid: "size_handler",
    application_id: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "size handler",
    style: {
      display: "block",
    },
    input: {
      value: {
        type: "handler",
        value: /* js */ `
          const selectedComponent = Utils.first(Editor.selectedComponents);
          const parameter = 'size';
          const sizeHandler = selectedComponent?.styleHandlers && selectedComponent?.styleHandlers['size'] || '';  
          return [parameter, sizeHandler];
        `,
      },
    },
    event: {
      codeChange: /* js */ `
        updateStyleHandlers(Utils.first(Editor.selectedComponents), 'size', EventData.value);
      `,
    },
  },
];