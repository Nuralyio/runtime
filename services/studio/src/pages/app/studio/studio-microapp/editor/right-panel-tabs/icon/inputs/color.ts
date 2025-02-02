import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../../helper/common_attributes.ts";
import { InputBlockContainerTheme } from "../../../utils/common-editor-theme.ts";

export default [
  {
    uuid: "icon_color_block",
    applicationId: "1",
    name: "icon color block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      ...InputBlockContainerTheme
    },
    childrenIds: ["icon_input_block", "icon_color_handler_block"]
  },
  {
    uuid: "icon_input_block",
    applicationId: "1",
    name: "placeholder block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between"
    },
    childrenIds: ["icon_color_label"]
  },
  {
    uuid: "icon_color_label",
    name: "icon color label",
    component_type: ComponentType.TextLabel,
    applicationId: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "string",
        value: 'Color'
      }
    },
    style: {
      width: "90px"
    }
  },
  {
    uuid: "icon_color_input",
    name: "name",
    applicationId: "1",
    component_type: ComponentType.ColorPicker,
    event: {
      valueChange: /* js */ `
        updateStyle(Utils.first(Editor.selectedComponents), "--hybrid-icon-color", EventData.value);
      `
    },
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "handler",
        value: /* js */ `
          const selectedComponent = Utils.first(Editor.selectedComponents);
          const currentColor = selectedComponent?.style && selectedComponent.style['--hybrid-icon-color'] || "";
          return currentColor;
        `
      },
      state: {
        type: "handler",
        value: /* js */ `
        
          const selectedComponent = Utils.first(Editor.selectedComponents);
          let state = 'enabled';
          if (selectedComponent.styleHandlers && selectedComponent.styleHandlers['--hybrid-icon-color']) {
            state = 'disabled';
          }
          return state;
        `
      }
    }
  },
  {
    uuid: "icon_color_handler_block",
    applicationId: "1",
    name: "icon color handler block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {},
    childrenIds: ["icon_color_input", "icon_color_handler"]
  },
  {
    uuid: "icon_color_handler",
    applicationId: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "icon color handler",
    style: {
      display: "block",
      width: "50px"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */ `
          const parameter = 'iconColor';
          let iconColorHandler = '';
          const selectedComponent = Utils.first(Editor.selectedComponents);
          if (selectedComponent) {
            iconColorHandler = selectedComponent?.styleHandlers && selectedComponent?.styleHandlers['--hybrid-icon-color'] || '';
          }
          return [parameter, iconColorHandler];
        `
      }
    },
    event: {
      codeChange: /* js */ `
        const selectedComponent = Utils.first(Editor.selectedComponents);
        updateStyleHandlers(selectedComponent, '--hybrid-icon-color', EventData.value);
      `
    }
  }
];