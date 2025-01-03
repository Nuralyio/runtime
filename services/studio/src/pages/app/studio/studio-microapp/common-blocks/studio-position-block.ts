import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";

export default [

  {
    uuid: "position_block",
    applicationId: "1",
    name: "position block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between",
      "width": "290px"
    },
    childrenIds: ["position_label", "position_select", "position_handler"]
  },
  {
    uuid: "position_label",
    name: "position label",
    component_type: ComponentType.TextLabel,
    applicationId: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "string",
        value: 'Position'
      }
    },
    style: {
      width: "90px"
    }
  },
  {
    uuid: "position_select",
    applicationId: "1",
    component_type: ComponentType.Select,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "position select",
    input: {
      value: {
        type: "handler",
        value: /* js */ `
                const selectedComponents = GetVar("selectedComponents") || [];
                const selectedComponent = selectedComponents[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid);
                let currentPosition = "";
                let isDisabled = false;

                if (currentComponent.styleHandlers && currentComponent.styleHandlers?.position) {
                    isDisabled = true;
                } else {
                    currentPosition = currentComponent?.style?.['position'] || 'static';
                }

                const options = [
                    { label: "Relative", value: "relative", disabled: isDisabled },
                    { label: "Absolute", value: "absolute", disabled: isDisabled },
                    { label: "Fixed", value: "fixed", disabled: isDisabled },
                    { label: "Sticky", value: "sticky", disabled: isDisabled },
                    { label: "Static", value: "static", disabled: isDisabled }
                ];
                return [options,[currentPosition? currentPosition : ""]]
                `
      }
    },
    style: {
      display: "block",
      "--hybrid-select-width": "155px",
      "size": "small"
    },
    event: {
      changed: /* js */ `
            try {
                const selectedComponents = GetVar("selectedComponents") || [];
                if (selectedComponents.length) {
                    const selectedComponent = selectedComponents[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid);
                    const positionValue = EventData.value;
                    updateStyle(currentComponent, 'position', positionValue);
                }
            } catch (error) {
                console.log(error);
            }
            `
    }
  },
  {
    uuid: "position_handler",
    applicationId: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "position handler",
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
                    const selectedComponents = GetVar("selectedComponents") || [];
                    if (selectedComponents.length) {
                        const selectedComponent = selectedComponents[0];
                        const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid);
                        positionHandler = currentComponent?.styleHandlers?.['position'] || '';
                    }
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
                const selectedComponents = GetVar("selectedComponents") || [];
                if (selectedComponents.length) {
                    const selectedComponent = selectedComponents[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid);
                    updateStyleHandlers(currentComponent, 'position', EventData.value);
                }
            } catch (error) {
                console.log(error);
            }
            `
    }
  }
  // Additional components (e.g., "top_block", "left_block") remain unchanged
];