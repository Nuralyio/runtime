import { COMMON_ATTRIBUTES } from "../../studio-microapp/helper/common_attributes.ts";
import { ComponentType } from "$store/component/interface.ts";

export default [
  {
    name: "font icon",
    uuid: "font_icon",
    component_type: ComponentType.Icon,
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    style:{
      "margin": "5px",
      "display": "block"
    },
    input : {
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
    style:{
      "margin": "5px 5px 5px 15px",
      "display": "block"
    },
    input : {
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
    style:{
      "margin": "5px 5px 5px 25px",
      "display": "block",
    },
    input : {
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
    style:{
      "margin": "5px 5px 5px 25px",
      "display": "block",
    },
    input : {
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
    style:{
      "margin": "5px 5px 5px 15px",
      "display": "block"
    },
    input : {
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
     
      direction: {
        type: "string",
        value: "horizontal"
      }
    },
    style: {
      padding : "6px 5px 0 5px"
    },
    childrenIds: [ "text_label_quick_action", "text_input_quick_action"]
  },
 
  {
    uuid : "text_input_quick_action",
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
      direction: {
        type: "string",
        value: "horizontal"
      }
    },
    childrenIds: [  "input_type_radio" , "label_font_size_input" , "font_size_input",   "width_icon", "width_input", "height_icon", "height_input"]

  },

  {
    uuid : "text_label_quick_action",
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
      direction: {
        type: "string",
        value: "horizontal"
      }
    },
    childrenIds: [ "font_icon", "font_family_select", "font_size_icon", "font_size_input_2", "bold_icon", "font_weight_content"]

  },


{
  name : "text label font size",
  uuid: "label_font_size_input",
  application_id: "1",
  component_type: ComponentType.TextLabel,
  ...COMMON_ATTRIBUTES,
  input:{
    value: {
      type: "string",
      value: "Label"
    }
  },
  style:{
    "margin" : "0px 10px 0px 15px"
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