import { COMMON_ATTRIBUTES } from "../../studio-microapp/helper/common_attributes.ts";
import { ComponentType } from "$store/component/interface.ts";

export default [
  {
    name: "font icon",
    uuid: "font_icon",
    component_type: ComponentType.Icon,
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
    component_type: ComponentType.Icon,
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
    component_type: ComponentType.Icon,
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
    component_type: ComponentType.Icon,
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
    component_type: ComponentType.Icon,
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
    component_type: ComponentType.Container,
    styleHandlers: {},
    ...COMMON_ATTRIBUTES,
    input: {

      
    },
    style: {
      padding: "6px 5px 0 5px"
    },
    childrenIds: [
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
    component_type: ComponentType.Container,
    input: {
      display: {
        type: "handler",
        value: /* js */`
        const selectedComponent = Utils.first(Editor.selectedComponents);
        
          return selectedComponent?.component_type == "text_input";
        `
      },
    },
    childrenIds: ["input_type_radio", "label_font_size_input", "font_size_input", "width_icon", "width_input", "height_icon", "height_input"]

  },

  {
    uuid: "checkbox_quick_action",
    application_id: "1",
    component_type: ComponentType.Container,
    input: {
      display: {
        type: "handler",
        value: /* js */`
        const selectedComponent = Utils.first(Editor.selectedComponents);
        
          return selectedComponent?.component_type == "select";
        `
      },
    },
    childrenIds: ["select_selectionmode_radio", "width_icon", "width_input", "height_icon", "height_input"]

  },

  {
    uuid: "select_quick_action",
    application_id: "1",
    component_type: ComponentType.Container,
    input: {
      display: {
        type: "handler",
        value: /* js */`
        const selectedComponent = Utils.first(Editor.selectedComponents);
        
          return selectedComponent?.component_type == "checkbox";
        `
      },
    },
    childrenIds: ["checkbox_checked_radio", "width_icon", "width_input", "height_icon", "height_input"]

  },
  {
    uuid: "datepicker_quick_action",
    application_id: "1",
    component_type: ComponentType.Container,
    input: {
      display: {
        type: "handler",
        value: /* js */`
        const selectedComponent = Utils.first(Editor.selectedComponents);
        
          return selectedComponent?.component_type == "Datepicker";
        `
      },
    },
    childrenIds: ["datepicker_format_select", "width_icon", "width_input", "height_icon", "height_input"]
  },
  {
    uuid: "container_quick_action",
    application_id: "1",
    component_type: ComponentType.Container,
    input: {
      display: {
        type: "handler",
        value: /* js */`
        const selectedComponent = Utils.first(Editor.selectedComponents);
        
          return selectedComponent?.component_type == "vertical-container-block";
        `
      },
    },
    childrenIds: ["table_direction_select", "width_icon", "width_input", "height_icon", "height_input", "app_insert_top_bar2"]
  },
  {
    uuid: "icon_quick_action",
    application_id: "1",
    component_type: ComponentType.Container,
    input: {
      display: {
        type: "handler",
        value: /* js */`
        const selectedComponent = Utils.first(Editor.selectedComponents);
        
          return selectedComponent?.component_type == "Icon";
        `
      },
    },
    childrenIds: ["icon_picker_content", "width_icon", "width_input", "height_icon", "height_input"]
  },
  {
    uuid: "image_quick_action",
    application_id: "1",
    component_type: ComponentType.Container,
    input: {
      display: {
        type: "handler",
        value: /* js */`
        const selectedComponent = Utils.first(Editor.selectedComponents);
        
          return selectedComponent?.component_type == "Image";
        `
      },
    },
    childrenIds: ["width_icon", "width_input", "height_icon", "height_input"]
  },
  {
    uuid: "collection_quick_action",
    application_id: "1",
    component_type: ComponentType.Container,
    input: {
      display: {
        type: "handler",
        value: /* js */`
        const selectedComponent = Utils.first(Editor.selectedComponents);
        
          return selectedComponent?.component_type == "Collection";
        `
      },
    },
    childrenIds: ["table_direction_select","label_collection_column_input", "column_input_2","width_icon", "width_input", "height_icon", "height_input"]
  },
  {
    uuid: "text_label_quick_action",
    application_id: "1",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    input: {
      display: {
        type: "handler",
        value: /* js */`
        const selectedComponent = Utils.first(Editor.selectedComponents);
          return selectedComponent?.component_type === "text_label";
        `
      },
    },
    childrenIds: ["font_icon", "font_family_select", "font_size_icon", "font_size_input_2", "bold_icon", "font_weight_content"]

  },
  {
    uuid: "button_quick_action",
    application_id: "1",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    input: {
      display: {
        type: "handler",
        value: /* js */`
        const selectedComponent = Utils.first(Editor.selectedComponents);
          return selectedComponent?.component_type === "button_input";
        `
      },
    },
    childrenIds: ["input_type_radio", "label_icon_input", "icon_picker_content", "width_icon", "width_input", "height_icon", "height_input"]

  },

  {
    uuid: "table_quick_action",
    application_id: "1",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    input: {
      display: {
        type: "handler",
        value: /* js */`
        const selectedComponent = Utils.first(Editor.selectedComponents);
          return selectedComponent?.component_type === "Table";
        `
      },
    },
    childrenIds: ["table_selectionmode_radio", "table_filter_radio", "width_icon", "width_input", "height_icon", "height_input"]

  },

  {
    name: "text label font size",
    uuid: "label_font_size_input",
    application_id: "1",
    component_type: ComponentType.TextLabel,
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
    component_type: ComponentType.TextLabel,
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "string",
        value: "Icon"
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
    component_type: ComponentType.TextLabel,
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
    component_type: ComponentType.AI
  },
  {
    uuid: "export-import-block-wrapper",
    application_id: "1",
    name: "export-import-block-wrapper",
    component_type: ComponentType.ExportImport
  },

];