import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../../helper/common_attributes.ts";
import { InputBlockContainerTheme, SelectTheme } from "../../../utils/common-editor-theme.ts";

export default [
  {
    uuid: "datepicker_format_block",
    application_id: "1",
    name: "datepicker format block",
    component_type: ComponentType.Container,
    styleHandlers: {},
    input: {
      direction: "vertical"
    },
    ...COMMON_ATTRIBUTES,
    style: {
      ...InputBlockContainerTheme
    },

    childrenIds: ["datepicker_input_block", "format_handler_block"]
  },
  {
    uuid: "datepicker_input_block",
    application_id: "1",
    name: "datepicker input block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between"
    },
    childrenIds: ["datepicker_format_label", "datepicker_format_content_container"]
  },

  {
    uuid: "datepicker_format_label",
    name: "text_label",
    component_type: ComponentType.TextLabel,
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    style: {
      width: "90px"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
          const label = 'Format';
          return label;
        `
      }
    }
  },

  {
    uuid: "datepicker_format_select",
    application_id: "1",
    component_type: ComponentType.Select,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "label datepicker format select",
    input: {
      value: {
        type: "handler",
        value: /* js */`
          const selectedComponent = Utils.first(Vars.selectedComponents);

          let format = selectedComponent?.input?.format?.value ?? 'DD/MM/YYYY';
          let selectedFormat;
          const options = [
            { label: "dd/mm/yyyy", value: "DD/MM/YYYY" },
            { label: "mm/dd/yyyyy", value: "MM/DD/YYYY" },
            { label: "yyyy/mm/dd", value: "YYYY/MM/DD" }
          ];

          if (format) {
            selectedFormat = options.find(option => option.value === format);   
          }

          const result = [options, [selectedFormat ? selectedFormat.label : ""]];
          return result;  
        `
      },
      placeholder : {
        type : "string", 
        value : "Select format"
      },
      state: {
        type: "handler",
        value: /* js */`
          const selectedComponent = Utils.first(Vars.selectedComponents);
          let state = "unabled";
          if (selectedComponent?.input?.format?.type === "handler" && selectedComponent?.input?.format?.value) {
            state = "disabled";
          }
          return state;
        `
      }
    },
    style: {
      ...SelectTheme
    },
    event: {
      changed: /* js */`
        const formatValue = EventData.value ? EventData.value : 'DD/MM/YYYY';
        updateInput(Utils.first(Vars.selectedComponents), "format", "string", formatValue);
      `
    }
  },
  {
    uuid: "format_handler_block",
    application_id: "1",
    name: "format handler block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "justify-content": "space-between"
    },

    childrenIds: ["datepicker_format_select", "format_handler"]
  },
  {
    uuid: "format_handler",
    application_id: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "format handler",
    style: {
      display: "block",
      width: "250px"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
          const parameter = 'format';
          const selectedComponent = Utils.first(Vars.selectedComponents);
          let formatHandler = '';

          if (selectedComponent?.input?.format?.type === 'handler' && selectedComponent?.input?.format?.value) {
            formatHandler = selectedComponent?.input?.format?.value;
          }

          return [parameter, formatHandler];
        `
      }
    },

    event: {
      codeChange: /* js */`
        const selectedComponent = Utils.first(Vars.selectedComponents);
        if (EventData.value !== selectedComponent?.input?.format?.value) {
          updateInput(selectedComponent, 'format', 'handler', EventData.value);
        }
      `
    }
  }
];