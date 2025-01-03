import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../../helper/common_attributes.ts";
import { InputBlockContainerTheme, SelectTheme } from "../../../utils/common-editor-theme.ts";

export const StudioContainerInputDirection = [
  {
    uuid: "table_direction_block",
    applicationId: "1",
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
    applicationId: "1",
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
    applicationId: "1",
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
    applicationId: "1",
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
                const selectedComponents = GetVar("selectedComponents") || [];
                const selectedComponent = selectedComponents[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid);
                let currentType = currentComponent?.style?.type || 'default';
                console.log('currentType',currentType);
                const options = [
                    { label: "Vertical", value: "vertical" },
                    { label: "Horizontal", value: "horizontal" },
                ];
                const result = [options, [currentType]];
                return result;
                `
      },
      state: {
        type: "handler",
        value: /* js */`
                const selectedComponents = GetVar("selectedComponents") || [];
                const selectedComponent = selectedComponents[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid);
                let isDisabled = 'enabled';
                if (currentComponent?.styleHandlers?.type) {
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
            try {
                const selectedComponents = GetVar("selectedComponents") || [];
                if (selectedComponents.length) {
                    const selectedComponent = selectedComponents[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid);
                    const typeValue = EventData.value || 'default';
                    console.log(EventData);
                    updateInput(currentComponent, "direction", 'string',typeValue);
                }
            } catch (error) {
                console.log(error);
            }
            `
    }
  },
  {
    uuid: "table_direction_handler_block",
    applicationId: "1",
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
    applicationId: "1",
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
                const parameter = 'type';
                let typeHandler = '';
                try {
                    const selectedComponents = GetVar("selectedComponents") || [];
                    if (selectedComponents.length) {
                        const selectedComponent = selectedComponents[0];
                        const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid);
                        typeHandler = currentComponent?.styleHandlers?.type || '';
                    }
                } catch (error) {
                    console.log(error);
                }
                return [parameter, typeHandler];
                `
      }
    },
    event: {
      codeChange: /* js */ `
            try {
                const selectedComponents = GetVar("selectedComponents") || [];
                if (selectedComponents.length) {
                    const selectedComponent = selectedComponents[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid);
                    updateStyleHandlers(currentComponent, 'type', EventData.value);
                }
            } catch (error) {
                console.log(error);
            }
            `
    }
  }
];