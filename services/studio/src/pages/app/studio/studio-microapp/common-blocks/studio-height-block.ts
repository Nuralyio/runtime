import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";

export default [
  {
    uuid: "height_vertical_container",
    application_id: "1",
    name: "height vertical container",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between",
      "width": "276px"
    },
    childrenIds: [
      "height_label",
      "height_input",
      "auto_height_checkbox",
      "height_handler_block",
      "height_handler"]
  },
  {
    uuid: "height_label",
    name: "height label",
    component_type: ComponentType.TextLabel,
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    style: {
      width: "90px"
    },
    input: {
      value: {
        type: "string",
        value: 'Height'
      }
    }
  },
  {
    uuid: "height_input",
    name: "height input",
    application_id: "1",
    component_type: ComponentType.TextInput,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "block",
      width: "80px",
      size: "small"
    },
    event: {
      valueChange:
      /* js */ `
        
          const selectedComponent = Utils.first(Vars.selectedComponents);
          if (selectedComponent) {
            updateStyle(selectedComponent, "height", EventData.value);
          }
       `
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
        return Editor.getComponentStyle(Utils.first(Vars.selectedComponents), 'height') || "auto";
        `
      },
      state: {
        type: "handler",
        value: /* js */`
          
            const selectedComponent = Utils.first(Vars.selectedComponents);
            return selectedComponent?.styleHandlers?.height ? 'disabled' : 'enabled';
          `
      }
    }
  },
  {
    uuid: "auto_height_checkbox",
    name: "auto height checkbox",
    application_id: "1",
    component_type: ComponentType.Checkbox,
    ...COMMON_ATTRIBUTES,
    style: {
      size: "small"
    },
    input: {
      label: {
        type: "handler",
        value: /* js */` return 'auto'; `
      },
      checked: {
        type: "handler",
        value: /* js */`
          
            const selectedComponent = Utils.first(Vars.selectedComponents);
            return !selectedComponent?.style?.height || selectedComponent?.input?.height?.value === 'auto' ? 'check' : '';
          `
      },
      state: {
        type: "handler",
        value: /* js */`
          
            const selectedComponent = Utils.first(Vars.selectedComponents);
            return selectedComponent?.styleHandlers?.height ? 'disabled' : 'enabled';
          `
      }
    },
    event: {
      checkboxChanged:  /* js */ `
        
          const selectedComponent = Utils.first(Vars.selectedComponents);
          if (selectedComponent) {
            const autoHeight = EventData.value;
            updateInput(selectedComponent, 'height', 'string', autoHeight ? 'auto' : '');
          }
       `
    }
  },
  {
    uuid: "height_handler",
    application_id: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "height handler",
    style: {
      display: "block"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
          
            const selectedComponent = Utils.first(Vars.selectedComponents);
            return ['height', selectedComponent?.styleHandlers?.height || ''];
          `
      }
    },
    event: {
      codeChange: /* js */ `
        
          const selectedComponent = Utils.first(Vars.selectedComponents);
          if (selectedComponent) {
            updateStyleHandlers(selectedComponent, 'height', EventData.value);
          }
       `
    }
  }
];
