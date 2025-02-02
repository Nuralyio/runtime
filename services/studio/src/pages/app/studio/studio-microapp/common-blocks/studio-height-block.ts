import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";

export default [
  {
    uuid: "height_vertical_container",
    applicationId: "1",
    name: "height vertical container",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between",
      "width": "290px"
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
    applicationId: "1",
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
    applicationId: "1",
    component_type: ComponentType.TextInput,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "block",
      width: "100px",
      size: "small"
    },
    event: {
      valueChange:
      /* js */ `
        try {
          const selectedComponent = Utils.first(Editor.selectedComponents);
          if (selectedComponent) {
            updateStyle(selectedComponent, "height", EventData.value);
          }
        } catch (error) {
          console.log(error);
        }`
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
        return Editor.getComponentStyle(Utils.first(Editor.selectedComponents), 'height') || 0;
        `
      },
      state: {
        type: "handler",
        value: /* js */`
          try {
            const selectedComponent = Utils.first(Editor.selectedComponents);
            return selectedComponent?.styleHandlers?.height ? 'disabled' : 'enabled';
          } catch (e) {
            console.log(e);
          }`
      }
    }
  },
  {
    uuid: "auto_height_checkbox",
    name: "auto height checkbox",
    applicationId: "1",
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
          try {
            const selectedComponent = Utils.first(Editor.selectedComponents);
            return !selectedComponent?.style?.height || selectedComponent?.input?.height?.value === 'auto' ? 'check' : '';
          } catch (e) {
            console.log(e);
          }`
      },
      state: {
        type: "handler",
        value: /* js */`
          try {
            const selectedComponent = Utils.first(Editor.selectedComponents);
            return selectedComponent?.styleHandlers?.height ? 'disabled' : 'enabled';
          } catch (e) {
            console.log(e);
          }`
      }
    },
    event: {
      checkboxChanged:  /* js */ `
        try {
          const selectedComponent = Utils.first(Editor.selectedComponents);
          if (selectedComponent) {
            const autoHeight = EventData.value;
            updateInput(selectedComponent, 'height', 'string', autoHeight ? 'auto' : '');
          }
        } catch (error) {
          console.log(error);
        }`
    }
  },
  {
    uuid: "height_handler",
    applicationId: "1",
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
          try {
            const selectedComponent = Utils.first(Editor.selectedComponents);
            return ['height', selectedComponent?.styleHandlers?.height || ''];
          } catch (error) {
            console.log(error);
          }`
      }
    },
    event: {
      codeChange: /* js */ `
        try {
          const selectedComponent = Utils.first(Editor.selectedComponents);
          if (selectedComponent) {
            updateStyleHandlers(selectedComponent, 'height', EventData.value);
          }
        } catch (error) {
          console.log(error);
        }`
    }
  }
];
