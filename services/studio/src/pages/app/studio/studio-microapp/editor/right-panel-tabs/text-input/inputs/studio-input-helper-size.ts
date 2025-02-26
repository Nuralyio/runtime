import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../../helper/common_attributes.ts";
import { InputBlockContainerTheme } from "../../../utils/common-editor-theme.ts";

export default [
  {
    uuid: "input_helper_font_size_vertical_container",
    application_id: "1",
    name: "Left panel",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      ...InputBlockContainerTheme
    },
    childrenIds: ["text_label_helper_font_size", "input_helper_size_handler_block"]
  },

  {
    uuid: "text_label_helper_font_size",
    name: "text_label",
    component_type: ComponentType.TextLabel,
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    style: {
      width: "90px"
    },
    input: {
      value: {
        type: "string",
        value: 'Helper size'
      }
    }

  },
  {
    uuid: "font_size_helper_input",
    name: "name",
    application_id: "1",
    component_type: ComponentType.NumberInput,
    parameters: {
      value: "22px"
    },
    ...COMMON_ATTRIBUTES,
    style: {
      width: "100px",
      size: "small"
    },
    event: {
      valueChange: /* js */ `
                    const selectedComponent = Utils.first(Editor.selectedComponents);
                    const unity = EventData.unity || 'px'
                    updateStyle(selectedComponent, "--hybrid-input-helper-text-font-size", EventData.value+unity);
  `
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
        const selectedComponent = Utils.first(Editor.selectedComponents);
        const fontSize = Editor.getComponentStyle(selectedComponent, "--hybrid-input-helper-text-font-size")?.split('');
        if (fontSize) {
          {
            let unity='';
            let value='';
            fontSize.forEach((char)=>
                {
                if(char>='0' && char<='9')
                    value+=char 
                else 
                unity+=char
                }
            );
            return [+value,unity]
        }
        }
        return [13, 'px'];
       
            `
      },
      state: {
        type: "handler",
        value:/* js */`
            const selectedComponent = Utils.first(Editor.selectedComponents);
            return selectedComponent?.styleHandlers?.["--hybrid-input-helper-text-font-size"] ? "disabled" : "enabled";
                `
      }
    }
  },
  {
    uuid: "input_helper_size_handler_block",
    application_id: "1",
    name: "input helper size handler block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "justify-content": "space-between"
    },
    childrenIds: ["font_size_helper_input", "input_helper_size_handler"]
  },
  {
    uuid: "input_helper_size_handler",
    application_id: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "input helper size handler",
    style: {
      display: "block"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
          const selectedComponent = Utils.first(Editor.selectedComponents);
          const helperSizeHandler = selectedComponent?.styleHandlers?.["--hybrid-input-helper-text-font-size"] || "";
          return ["helperSize", helperSizeHandler];
            `
      }
    },

    event: {
      codeChange: /* js */ `
              const selectedComponent = Utils.first(Editor.selectedComponents);
              updateStyleHandlers(selectedComponent,'--hybrid-input-helper-text-font-size',EventData.value)
      `
    }
  }

];