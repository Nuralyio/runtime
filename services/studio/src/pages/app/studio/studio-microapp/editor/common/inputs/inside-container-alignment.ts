import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../helper/common_attributes.ts";
import { InputBlockContainerTheme, SelectTheme } from "../../utils/common-editor-theme.ts";

export const StudioInnerContainerInputAlignment = [
  {
    uuid: "inner_container_alignement_block",
    applicationId: "1",
    name: "button type block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      ...InputBlockContainerTheme
    },
    childrenIds: ["inner_container_radio_block", "inner_container_handler_block"]
  },
  {
    uuid: "inner_container_radio_block",
    applicationId: "1",
    name: "placeholder block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between"
    },
    childrenIds: ["inner_container_label"]
  },
  {
    uuid: "inner_container_label",
    name: "button type label",
    component_type: ComponentType.TextLabel,
    applicationId: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "handler",
        value: /* js */`
                const typeLabel = 'Inner Container alignment';
                return typeLabel;
                `
      }
    },
    style: {
      width: "90px",
    }
  },
  {
    uuid: "inner_container_select",
    applicationId: "1",
    component_type: ComponentType.Select,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "button type select",
    input: {
      placeholder: {
        type: "handler",
        value: /* js */`
                const placeholder = 'Direction';
                return placeholder;
                `
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
                    { label: "Start", value: "start" },
                    { label: "End", value: "end" },
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
      ...SelectTheme
    },
    event: {
      changed: /* js */ `
            try {
                const selectedComponents = GetVar("selectedComponents") || [];
                if (selectedComponents.length) {
                    const selectedComponent = selectedComponents[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid);
                    const typeValue = EventData.value || 'start';
                    updateInput(currentComponent, "innerAlignment", 'string',typeValue);
                }
            } catch (error) {
                console.log(error);
            }
            `
    }
  },
  {
    uuid: "inner_container_handler_block",
    applicationId: "1",
    name: "button type handler block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "justify-content": "space-between",
      "align-items": "center"
    },
    childrenIds: ["inner_container_select", "inner_container_handler"]
  },
  {
    uuid: "inner_container_handler",
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