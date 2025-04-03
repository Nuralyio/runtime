import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";

export default [
  {
    uuid: "width_vertical_container",
    application_id: "1",
    name: "width vertical container",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between",
      "width": "276px"
    },
    childrenIds: [
      "width_label",
      "width_container",
      "auto_width_block",
      "width_handler_block",
      "width_handler"
    ]
  },

  {
    uuid: "width_container",
    name: "width container",
    component_type: ComponentType.Container,
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center"
    },
    childrenIds: [
      "width_input", 
      "auto_width_checkbox"
    ]

  },

  {
    uuid: "width_label",
    name: "width label",
    component_type: ComponentType.TextLabel,
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    style: {
      "width": "90px"
    },
    input: {
      value: {
        type: "string",
        value: 'Width'
      }
    }

  },
  {
    uuid: "width_input",
    name: "width input",
    application_id: "1",
    component_type: ComponentType.TextInput,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "block",
      width: "80px",
      size: "small"
    },
    event: {
      onArrowUp: /* js */ `
      try {
        const selectedComponent = Utils.first(Vars.selectedComponents);
          let width = Editor.getComponentStyle(selectedComponent, 'width') || "0px"
            width = width.trim();
            let numericPart = "";
            let unitPart = "";
    
            for (let i = 0; i < width.length; i++) {
                if (width[i] >= '0' && width[i] <= '9' || width[i] === '.') {
                    numericPart += width[i];
                } else {
                    unitPart = width.substring(i);
                    break;
                }
            }
    
            let numericValue = parseFloat(numericPart) || 0;
            let unit = unitPart.trim() || "px";
    
            numericValue += 1;
            updateStyle(selectedComponent, "width", numericValue + unit);
    } catch (error) {}
  `,
      onArrowDown: /* js */ `
      try {
        const selectedComponent = Utils.first(Vars.selectedComponents);
        if (selectedComponent) {
            let width = selectedComponent?.style?.width || "0px";
            width = width.trim();
            let numericPart = "";
            let unitPart = "";
    
            for (let i = 0; i < width.length; i++) {
                if (width[i] >= '0' && width[i] <= '9' || width[i] === '.') {
                    numericPart += width[i];
                } else {
                    unitPart = width.substring(i);
                    break;
                }
            }
    
            let numericValue = parseFloat(numericPart) || 0;
            let unit = unitPart.trim() || "px";
    
            numericValue -= 1;
            updateStyle(selectedComponent, "width", numericValue + unit);
        }
    } catch (error) {}
  `,
      valueChange: /* js */ `
            try {
                const selectedComponent = Utils.first(Vars.selectedComponents);
                if (selectedComponent) {
                    updateStyle(selectedComponent, "width", EventData.value ?? "auto");
                }
            } catch (error) {
                console.log(error);
            }`
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
          return Editor.getComponentStyle(Utils.first(Vars.selectedComponents), 'width') || "auto";
        `
      },
      state: {
        type: "handler",
        value: /* js */`
          const selectedComponent = Utils.first(Vars.selectedComponents);
          return selectedComponent?.styleHandlers?.['width'] ? 'disabled' : 'enabled';
        `
      }
    }
  },

  {
    uuid: "auto_width_checkbox",
    name: "auto width checkbox",
    application_id: "1",
    component_type: ComponentType.Checkbox,
    ...COMMON_ATTRIBUTES,
    style: {
      size: "small"
    },
    input: {
      label: {
        type: "handler",
        value: /* js */`
              return 'auto';
        `
      },
      checked: {
        type: "handler",
        value: /* js */`
            try {
                const selectedComponent = Utils.first(Vars.selectedComponents);
                if (selectedComponent) {
                    return !selectedComponent?.style?.width || selectedComponent?.input?.width?.value == 'auto' ? 'check' : '';
                }
            } catch (e) {
                console.log(e);
            }
        `
      },
      state: {
        type: "handler",
        value: /* js */`
            try {
                const selectedComponent = Utils.first(Vars.selectedComponents);
                if (selectedComponent) {
                    return selectedComponent?.styleHandlers?.['width'] ? 'disabled' : 'enabled';
                }
            } catch (e) {
                console.log(e);
            }
        `
      }
    },
    event: {
      checkboxChanged:  /* js */ `
            try {
                const selectedComponent = Utils.first(Vars.selectedComponents);
                if (selectedComponent) {
                    updateInput(selectedComponent, 'width', 'string', EventData.value ? 'auto' : '');
                }
            } catch (error) {
                console.log(error);
            }`
    }
  },

  {
    uuid: "width_handler",
    application_id: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "width handler",
    style: {
      display: "block"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
            try {
                const selectedComponent = Utils.first(Vars.selectedComponents);
                return ['width', selectedComponent?.styleHandlers?.['width'] || ''];
            } catch (error) {
                console.log(error);
                return ['width', ''];
            }
        `
      }
    },
    event: {
      codeChange: /* js */ `
            try {
                const selectedComponent = Utils.first(Vars.selectedComponents);
                if (selectedComponent) {
                    updateStyleHandlers(selectedComponent, 'width', EventData.value);
                }
            } catch (error) {
                console.log(error);
            }
      `
    }
  }
];