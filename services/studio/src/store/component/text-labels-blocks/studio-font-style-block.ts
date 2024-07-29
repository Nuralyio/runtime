import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../common_attributes";
export default [
    {
        uuid: "font_style_block",
        applicationId: "1",
        name: "Left panel",
        component_type: ComponentType.VerticalContainer,
        styleHandlers: {},
        input: {
            direction: "vertical",
        },

        ...COMMON_ATTRIBUTES,
        style: {
            width: "250px",
            display: 'flex',
            'flex-direction': 'column',
            "margin-top": "10px"
        },
        childrenIds: ["text_label_font_style", "font_style_values_block"],
    },
    {
        uuid: "text_label_font_style",
        name: "text_label",
        component_type: ComponentType.TextLabel,
        parameters: {
            value: "Font Style",
        },
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
    },
    {
        uuid: "font_style_values_block",
        applicationId: "1",
        name: "Left panel",
        component_type: ComponentType.VerticalContainer,
        styleHandlers: {},
        input: {
            direction: "vertical",
        },

        ...COMMON_ATTRIBUTES,
        style: {
            width: "150px",
            display: 'flex',
            gap: "10px"
        },
        childrenIds: ["font_style_normal", "font_style_italic", "font_style_oblique"],
    },
    {
        uuid: "font_style_normal",
        name: "name",
        applicationId: "1",
        component_type: ComponentType.IconButton,
        styleHandlers: {},
        ...COMMON_ATTRIBUTES,
        parameters: {
            icon: "font-awesome",
        },

        event: {
            click: /* js */ `
           
           try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    updateStyle(currentComponent, "font-style", "normal");
        
                }
            }catch(error){
                console.log(error);
            }
            
      `
        },

    },
    {
        uuid: "font_style_italic",
        name: "name",
        applicationId: "1",
        component_type: ComponentType.IconButton,
        styleHandlers: {},
        ...COMMON_ATTRIBUTES,
        parameters: {
            icon: "italic",
        },

        event: {
            click: /* js */ `
           
           try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    updateStyle(currentComponent, "font-style", "italic");
        
                }
            }catch(error){
                console.log(error);
            }
            
      `
        },
    },

    {
        uuid: "font_style_oblique",
        name: "name",
        applicationId: "1",
        component_type: ComponentType.IconButton,
        styleHandlers: {},
        ...COMMON_ATTRIBUTES,
        parameters: {
            icon: "font-awesome",
        },

        event: {
            click: /* js */ `
           
           try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    updateStyle(currentComponent, "font-style", "oblique");
        
                }
            }catch(error){
                console.log(error);
            }
            
      `
        },
    },
] 
