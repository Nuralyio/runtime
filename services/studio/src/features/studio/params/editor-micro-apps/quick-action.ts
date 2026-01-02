import { COMMON_ATTRIBUTES } from '../../core/helpers/common_attributes.ts';
export default [
  {
    name: "font icon",
    uuid: "font_icon",
    type: "icon",
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    style: {
      "margin": "5px",
      "display": "block"
    },
    input: {
      icon: {
        type: "string",
        value: "font"
      }
    }
  },

  {
    name: "font icon",
    uuid: "font_size_icon",
    type: "icon",
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    style: {
      "margin": "5px 5px 5px 15px",
      "display": "block"
    },
    input: {
      icon: {
        type: "string",
        value: "i-cursor"
      }
    }
  },


  {
    name: "width_icon",
    uuid: "width_icon",
    type: "icon",
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    style: {
      "margin": "5px 5px 5px 25px",
      "display": "block",
    },
    input: {
      icon: {
        type: "string",
        value: "arrows-alt-h"
      }
    }
  },

  {
    name: "height_icon",
    uuid: "height_icon",
    type: "icon",
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    style: {
      "margin": "5px 5px 5px 25px",
      "display": "block",
    },
    input: {
      icon: {
        type: "string",
        value: "arrows-alt-v"
      }
    }
  },
  {
    name: "font icon",
    uuid: "bold_icon",
    type: "icon",
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    style: {
      "margin": "5px 5px 5px 15px",
      "display": "block"
    },
    input: {
      icon: {
        type: "string",
        value: "bold"
      }
    }
  },

  {
    uuid: "quick-action-wrapper",
    application_id: "1",
    name: "helper text block",
    type: "container",
    style_handlers: {},
    ...COMMON_ATTRIBUTES,
    input: {

      
    },
    style: {
      padding: "6px 5px 0 5px"
    },
    children_ids: [
      "text_label_quick_action",
      "text_input_quick_action",
      "checkbox_quick_action",
      "select_quick_action",
      "datepicker_quick_action",
      "container_quick_action",
      "icon_quick_action",
      "image_quick_action",
      "collection_quick_action",
      "button_quick_action",
      "table_quick_action"
    ]
  },

  {
    uuid: "text_input_quick_action",
    application_id: "1",
    type: "container",
    input: {
      display: {
        type: "handler",
        value: /* js */`
        const selectedComponent = Utils.first($selectedComponents);
        
          return selectedComponent?.type == "text_input";
        `
      },
    },
    children_ids: ["input_type_radio", "label_font_size_input", "font_size_input", "width_icon", "width_input", "height_icon", "height_input"]

  },

  {
    uuid: "checkbox_quick_action",
    application_id: "1",
    type: "container",
    input: {
      display: {
        type: "handler",
        value: /* js */`
        const selectedComponent = Utils.first($selectedComponents);
        
          return selectedComponent?.type == "select";
        `
      },
    },
    children_ids: ["select_selectionmode_radio", "width_icon", "width_input", "height_icon", "height_input"]

  },

  {
    uuid: "select_quick_action",
    application_id: "1",
    type: "container",
    input: {
      display: {
        type: "handler",
        value: /* js */`
        const selectedComponent = Utils.first($selectedComponents);
        
          return selectedComponent?.type == "checkbox";
        `
      },
    },
    children_ids: ["checkbox_checked_radio", "width_icon", "width_input", "height_icon", "height_input"]

  },
  {
    uuid: "datepicker_quick_action",
    application_id: "1",
    type: "container",
    input: {
      display: {
        type: "handler",
        value: /* js */`
        const selectedComponent = Utils.first($selectedComponents);
        
          return selectedComponent?.type == "date_picker";
        `
      },
    },
    children_ids: ["datepicker_format_select", "width_icon", "width_input", "height_icon", "height_input"]
  },
  {
    uuid: "container_quick_action",
    application_id: "1",
    type: "container",
    input: {
      display: {
        type: "handler",
        value: /* js */`
        const selectedComponent = Utils.first($selectedComponents);
        
          return selectedComponent?.type == "container";
        `
      },
    },
    children_ids: ["table_direction_select", "width_icon", "width_input", "height_icon", "height_input", "app_insert_top_bar2"]
  },
  {
    uuid: "icon_quick_action",
    application_id: "1",
    type: "container",
    input: {
      display: {
        type: "handler",
        value: /* js */`
        const selectedComponent = Utils.first($selectedComponents);
        
          return selectedComponent?.type == "icon";
        `
      },
    },
    children_ids: ["icon_picker_content", "width_icon", "width_input", "height_icon", "height_input"]
  },
  {
    uuid: "image_quick_action",
    application_id: "1",
    type: "container",
    input: {
      display: {
        type: "handler",
        value: /* js */`
        const selectedComponent = Utils.first($selectedComponents);
        
          return selectedComponent?.type == "image";
        `
      },
    },
    children_ids: ["width_icon", "width_input", "height_icon", "height_input"]
  },
  {
    uuid: "collection_quick_action",
    application_id: "1",
    type: "container",
    input: {
      display: {
        type: "handler",
        value: /* js */`
        const selectedComponent = Utils.first($selectedComponents);
        
          return selectedComponent?.type == "collection";
        `
      },
    },
    children_ids: ["table_direction_select","label_collection_column_input", "column_input_2","width_icon", "width_input", "height_icon", "height_input"]
  },
  {
    uuid: "text_label_quick_action",
    application_id: "1",
    type: "container",
    ...COMMON_ATTRIBUTES,
    input: {
      display: {
        type: "handler",
        value: /* js */`
        const selectedComponent = Utils.first($selectedComponents);
          return selectedComponent?.type === "text_label";
        `
      },
    },
    children_ids: ["font_icon", "font_family_select", "font_size_icon", "font_size_input_2", "bold_icon", "font_weight_content"]

  },
  {
    uuid: "button_quick_action",
    application_id: "1",
    type: "container",
    ...COMMON_ATTRIBUTES,
    input: {
      display: {
        type: "handler",
        value: /* js */`
        const selectedComponent = Utils.first($selectedComponents);
          return selectedComponent?.type === "button_input";
        `
      },
    },
    children_ids: ["input_type_radio", "label_icon_input", "icon_picker_content", "width_icon", "width_input", "height_icon", "height_input"]

  },

  {
    uuid: "table_quick_action",
    application_id: "1",
    type: "container",
    ...COMMON_ATTRIBUTES,
    input: {
      display: {
        type: "handler",
        value: /* js */`
        const selectedComponent = Utils.first($selectedComponents);
          return selectedComponent?.type === "table";
        `
      },
    },
    children_ids: ["table_selectionmode_radio", "table_filter_radio", "width_icon", "width_input", "height_icon", "height_input"]

  },

  {
    name: "text label font size",
    uuid: "label_font_size_input",
    application_id: "1",
    type: "text_label",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "string",
        value: "Label"
      }
    },
    style: {
      "margin": "0px 10px 0px 15px"
    }
  },

  {
    name: "text label font size",
    uuid: "label_icon_input",
    application_id: "1",
    type: "text_label",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "string",
        value: "icon"
      }
    },
    style: {
      "margin": "0px 10px 0px 15px"
    }
  },

  {
    name: "text label font size",
    uuid: "label_collection_column_input",
    application_id: "1",
    type: "text_label",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "string",
        value: "Column"
      }
    },
    style: {
      "margin": "0px 10px 0px 15px"
    }
  },
  {
    name: "name",
    application_id: "1",
    type: "ai"
  },
  {
    uuid: "export-import-block-wrapper",
    application_id: "1",
    name: "export-import-block-wrapper",
    type: "export_import"
  },

];