import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../../helper/common_attributes.ts";
import { SelectTheme } from "../../../utils/common-editor-theme.ts";

export default [
  {
    uuid: "button_type_block",
    application_id: "1",
    name: "button type block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between",
      width: "290px"
    },
    childrenIds: ["button_type_radio_block", "button_type_handler_block"]
  },
  {
    uuid: "button_type_radio_block",
    application_id: "1",
    name: "placeholder block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between"
    },
    childrenIds: ["button_type_label"]
  },
  {
    uuid: "button_type_label",
    name: "button type label",
    component_type: ComponentType.TextLabel,
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "string",
        value: 'Type'
      }
    },
    style: {
      width: "90px",
      marginLeft: "5px"
    }
  },
  {
    uuid: "button_type_select",
    application_id: "1",
    component_type: ComponentType.Select,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "button type select",
    input: {
      placeholder: {
        type: "handler",
        value: /* js */ `return 'Type';`
      },
      value: {
        type: "handler",
        value: /* js */ `
            const selectedComponent = Utils.first(Vars.selectedComponents);
            const currentType = Editor.getComponentStyle(selectedComponent, 'type') || 'default';
            const options = [
              { label: "Primary", value: "primary" },
              { label: "Secondary", value: "secondary" },
              { label: "Danger", value: "danger" },
              { label: "Ghost", value: "ghost" },
              { label: "Default", value: "default" },
            ];
            
            return [options, [currentType]];
          `
      },
      state: {
        type: "handler",
        value: /* js */ `
            const selectedComponent = Utils.first(Vars.selectedComponents);
            return selectedComponent?.styleHandlers?.type ? 'disabled' : 'enabled';
          `
      }
    },
    style: {
      display: "block",
      ...SelectTheme
    },
    event: {
      changed: /* js */ `
            updateStyle(Utils.first(Vars.selectedComponents), "type", EventData.value || 'default');
        `
    }
  },
  {
    uuid: "button_type_handler_block",
    application_id: "1",
    name: "button type handler block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "justify-content": "space-between",
      "align-items": "center"
    },
    childrenIds: ["button_type_select", "button_type_handler"]
  },
  {
    uuid: "button_type_handler",
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
          try {
            const selectedComponent = Utils.first(Vars.selectedComponents);
            if (!selectedComponent) return ['type', ''];
            
            const currentComponent = GetComponent(
              selectedComponent,
              GetVar("currentEditingApplication").uuid
            );
            
            return ['type', currentComponent?.styleHandlers?.type || ''];
          } catch(error) {
            console.error(error);
            return ['type', ''];
          }`
      }
    },
    event: {
      codeChange: /* js */ `
            updateStyleHandlers(Utils.first(Vars.selectedComponents), 'type', EventData.value);
        `
    }
  }
];