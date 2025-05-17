import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";

export default [
  {
    uuid: "position_block",
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
    childrenIds: ["position_label", "position_select", "position_handler"]
  },
  {
    uuid: "position_label",
    application_id: "1",
    name: "Position Label",
    component_type: ComponentType.TextLabel,
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "string",
        value: "Position"
      }
    },
    style: {
      width: "90px"
    }
  },
  {
    uuid: "position_select",
    application_id: "1",
    name: "Position Select",
    component_type: ComponentType.Select,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    input: {
      value: {
        type: "handler",
        value: /* js */ `
          const selectedComponent = Utils.first(Vars.selectedComponents);
          let currentPosition = "";
          let isDisabled = false;

          if (selectedComponent?.styleHandlers?.position) {
            isDisabled = true;
          } else {
            currentPosition = Editor.getComponentStyle(selectedComponent, 'position') || 'static';
          }

          const options = [
            { label: "Relative", value: "relative", disabled: isDisabled },
            { label: "Absolute", value: "absolute", disabled: isDisabled },
            { label: "Fixed", value: "fixed", disabled: isDisabled },
            { label: "Sticky", value: "sticky", disabled: isDisabled },
            { label: "Static", value: "static", disabled: isDisabled }
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
        
          const selectedComponent = Utils.first(Vars.selectedComponents);
          const positionValue = EventData.value;
          updateStyle(selectedComponent, 'position', positionValue);
       
      `
    }
  },
  {
    uuid: "position_handler",
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
          
          
            const selectedComponent = Utils.first(Vars.selectedComponents);
            positionHandler = selectedComponent?.styleHandlers?.['position'] || '';
          

          return [parameter, positionHandler];
        `
      }
    },
    event: {
      codeChange: /* js */ `
        
          const selectedComponent = Utils.first(Vars.selectedComponents);
          updateStyleHandlers(selectedComponent, 'position', EventData.value);
       
      `
    }
  }
];