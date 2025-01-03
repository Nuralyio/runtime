import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../../helper/common_attributes.ts";
import { InputBlockContainerTheme, SelectTheme } from "../../../utils/common-editor-theme.ts";

export const StudioInputAlignmentDirection = [
  {
    uuid: "container_alignment_block",
    applicationId: "1",
    name: "button type block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      ...InputBlockContainerTheme
    },
    childrenIds: ["container_alignment_radio_block", "container_alignment_handler_block"]
  },
  {
    uuid: "container_alignment_radio_block",
    applicationId: "1",
    name: "placeholder block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between"
    },
    childrenIds: ["container_alignment_label"]
  },
  {
    uuid: "container_alignment_label",
    name: "button type label",
    component_type: ComponentType.TextLabel,
    applicationId: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "handler",
        value: /* js */`
              const typeLabel = 'Alignment';
                return typeLabel;
                `
      }
    },
    style: {
      width: "90px",
    }
  },
  {
    uuid: "container_alignment_select",
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
                let currentType = currentComponent?.input?.direction?.value || 'default';
                console.log('currentType',currentType);
                const options = [
                    { label: "Start", value: "flex-start" },
                    { label: "End", value: "flex-end" },
                    { label: "Center", value: "center" },
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
                    updateStyle(currentComponent,'justify-content',typeValue)

                }
            } catch (error) {
                console.log(error);
            }
            `
    }
  },
  {
    uuid: "container_alignment_handler_block",
    applicationId: "1",
    name: "button type handler block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "justify-content": "space-between",
      "align-items": "center"
    },
    childrenIds: ["container_alignment_select", "container_alignment_handler"]
  },
  {
    uuid: "container_alignment_handler",
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
                    updateStyleHandlers(currentComponent, 'justify-content', EventData.value);
                }
            } catch (error) {
                console.log(error);
            }
            `
    }
  }
];