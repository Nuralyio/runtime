import { COMMON_ATTRIBUTES } from "../helpers/common_attributes.ts";
import { InputBlockContainerTheme } from "../utils/common-editor-theme.ts";

export default [
  {
    uuid: "icon_picker_block",
    application_id: "1",
    name: "icon picker block",
    type: "container",
    ...COMMON_ATTRIBUTES,
    style: {
      ...InputBlockContainerTheme
    },
    children_ids: ["icon_picker_input_block", "icon_picker_handler_block"]
  },
  {
    uuid: "icon_picker_input_block",
    application_id: "1",
    name: "placeholder block",
    type: "container",
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between"
    },
    children_ids: ["icon_picker_label"]
  },
  {
    uuid: "icon_picker_label",
    name: "icon picker label",
    type: "text_label",
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "string",
        value: 'Icon'
      }
    },
    style: {
      width: "90px"
    }
  },
  {
    uuid: "icon_picker_content",
    application_id: "1",
    type: "icon_picker",
    ...COMMON_ATTRIBUTES,
    style_handlers: {},
    name: "icon picker content",
    input: {
      value: {
        type: "handler",
        value: /* js */ ` 
          const selectedComponent = Utils.first($selectedComponents);
          const Input = selectedComponent ? Editor.getComponentBreakpointInput(selectedComponent, 'icon') : null;

          return Input?.value || '';
        `
      },
      placeholder: {
        type: "handler",
        value: /* js */ ` 
          return 'Choose an icon';
        `
      },
      disable: {
        type: "handler",
        value: /* js */ ` 
          const selectedComponent = Utils.first($selectedComponents);
          return !!(
            selectedComponent?.input?.icon?.type === "handler" && 
            selectedComponent?.input?.icon?.value
          );
        `
      }
    },
    event: {
      onChange: /* js */ `
        const selectedComponent = Utils.first($selectedComponents);
          updateInput(selectedComponent, 'icon', 'string', EventData.value);
      `
    }
  },
  {
    uuid: "icon_picker_handler_block",
    application_id: "1",
    name: "icon picker handler block",
    type: "container",
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "justify-content": "space-between"
    },
    children_ids: ["icon_picker_content", "icon_picker_handler"]
  },
  {
    uuid: "icon_picker_handler",
    application_id: "1",
    type: "event",
    ...COMMON_ATTRIBUTES,
    style_handlers: {},
    name: "icon picker handler",
    style: {
      display: "block",
      width: "50px"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
          const parameter = 'iconPicker';
          const selectedComponent = Utils.first($selectedComponents);
          const iconPickerHandler = selectedComponent?.input?.icon?.type === 'handler' 
            ? selectedComponent?.input?.icon?.value 
            : '';
          return [parameter, iconPickerHandler];
        `
      }
    },
    event: {
      codeChange: /* js */ `
        const selectedComponent = Utils.first($selectedComponents);
        if (selectedComponent && EventData.value !== selectedComponent?.input?.icon?.value) {
          updateInput(selectedComponent, 'icon', 'handler', EventData.value);
        }
      `
    }
  }
];