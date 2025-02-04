import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../helper/common_attributes.ts";
import { InputBlockContainerTheme } from "../../utils/common-editor-theme.ts";

export default [
  {
    uuid: "icon_picker_block",
    application_id: "1",
    name: "icon picker block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      ...InputBlockContainerTheme
    },
    childrenIds: ["icon_picker_input_block", "icon_picker_handler_block"]
  },
  {
    uuid: "icon_picker_input_block",
    application_id: "1",
    name: "placeholder block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between"
    },
    childrenIds: ["icon_picker_label"]
  },
  {
    uuid: "icon_picker_label",
    name: "icon picker label",
    component_type: ComponentType.TextLabel,
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
    component_type: ComponentType.IconPicker,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "icon picker content",
    input: {
      value: {
        type: "handler",
        value: /* js */ ` 
          const selectedComponent = Utils.first(Editor.selectedComponents);
          return selectedComponent?.input?.icon?.value || '';
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
          const selectedComponent = Utils.first(Editor.selectedComponents);
          return !!(
            selectedComponent?.input?.icon?.type === "handler" && 
            selectedComponent?.input?.icon?.value
          );
        `
      }
    },
    event: {
      iconChanged: /* js */ `
        const selectedComponent = Utils.first(Editor.selectedComponents);
          updateInput(selectedComponent, 'icon', 'string', EventData.value);
      `
    }
  },
  {
    uuid: "icon_picker_handler_block",
    application_id: "1",
    name: "icon picker handler block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "justify-content": "space-between"
    },
    childrenIds: ["icon_picker_content", "icon_picker_handler"]
  },
  {
    uuid: "icon_picker_handler",
    application_id: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
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
          const selectedComponent = Utils.first(Editor.selectedComponents);
          const iconPickerHandler = selectedComponent?.input?.icon?.type === 'handler' 
            ? selectedComponent?.input?.icon?.value 
            : '';
          return [parameter, iconPickerHandler];
        `
      }
    },
    event: {
      codeChange: /* js */ `
        const selectedComponent = Utils.first(Editor.selectedComponents);
        if (selectedComponent && EventData.value !== selectedComponent?.input?.icon?.value) {
          updateInput(selectedComponent, 'icon', 'handler', EventData.value);
        }
      `
    }
  }
];