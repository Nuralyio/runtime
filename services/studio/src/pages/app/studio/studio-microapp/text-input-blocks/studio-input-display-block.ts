import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";

export default [
  {
    uuid: "input_display_block",
    applicationId: "1",
    name: "input display block",
    component_type: ComponentType.Container,
    styleHandlers: {},
    ...COMMON_ATTRIBUTES,
    style: {
      width: "220px",
      "margin-top": "10px",
      display: "flex",
      "justify-content": "space-between"
    },

    childrenIds: ["input_text_label_display", "input_display_content"]
  },
  {
    uuid: "input_text_label_display",
    name: "text_label",
    component_type: ComponentType.TextLabel,
    applicationId: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "handler",
        value: /* js */`
               const label ='Display';
             return label;
            `
      }
    }
  },
  {
    uuid: "input_display_content",
    applicationId: "1",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "input display content",
    style: {
      display: "block",
      width: "250px"
    },
    childrenIds: ["input_display_yes", "input_display_no"]
  },
  {
    uuid: "input_display_yes",
    name: "name",
    applicationId: "1",
    component_type: ComponentType.IconButton,
    styleHandlers: {},
    ...COMMON_ATTRIBUTES,
    parameters: {
      icon: "eye"
    },

    event: {
      click: /* js */ `
           try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    updateStyle(currentComponent,display,true)

                }
            }catch(error){
                console.log(error);
            }      
      `
    }
  },
  {
    uuid: "input_display_no",
    name: "name",
    applicationId: "1",
    component_type: ComponentType.IconButton,
    styleHandlers: {},
    ...COMMON_ATTRIBUTES,
    parameters: {
      icon: "eye-slash"
    },

    event: {
      click: /* js */ `
           try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    updateStyle(currentComponent,display,false)
                }
            }catch(error){
                console.log(error);
            }`
    }


  }
];
