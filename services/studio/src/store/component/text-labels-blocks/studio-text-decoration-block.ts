import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
        uuid: "text_decoration_block",
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
        childrenIds: ["text_label_text_decoration", "text_decoration_values_block"],
    },
    {
        uuid: "text_label_text_decoration",
        name: "text_label",
        component_type: ComponentType.TextLabel,
        parameters: {
            value: "Text decoration",
        },
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
    },
    {
        uuid: "text_decoration_values_block",
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
            gap: "10px"
        },
        childrenIds: ["text_decoration_overline", "text_decoration_line_through", "text_decoration_underline", "text_decoration_underline_overline", "text_decoration_none"],
    },
    {
        uuid: "text_decoration_overline",
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
                    updateStyle(currentComponent, "text-decoration", "overline");
        
                }
            }catch(error){
                console.log(error);
            }
            
      `
        },

    },
    {
        uuid: "text_decoration_line_through",
        name: "name",
        applicationId: "1",
        component_type: ComponentType.IconButton,
        styleHandlers: {},
        ...COMMON_ATTRIBUTES,
        parameters: {
            icon: "strikethrough",
        },

        event: {
            click: /* js */ `
           
           try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    updateStyle(currentComponent, "text-decoration", "line-through");
        
                }
            }catch(error){
                console.log(error);
            }
            
      `
        },
    },

    {
        uuid: "text_decoration_underline",
        name: "name",
        applicationId: "1",
        component_type: ComponentType.IconButton,
        styleHandlers: {},
        ...COMMON_ATTRIBUTES,
        parameters: {
            icon: "underline",
        },

        event: {
            click: /* js */ `
           
           try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    updateStyle(currentComponent, "text-decoration", "underline");
        
                }
            }catch(error){
                console.log(error);
            }
            
      `
        },
    },
    {
        uuid: "text_decoration_underline_overline",
        name: "name",
        applicationId: "1",
        component_type: ComponentType.IconButton,
        styleHandlers: {},
        ...COMMON_ATTRIBUTES,
        parameters: {
            icon: "grip-lines",
        },

        event: {
            click: /* js */ `
           
           try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    updateStyle(currentComponent, "text-decoration", "underline overline");
        
                }
            }catch(error){
                console.log(error);
            }
            
      `
        },
    },
    {
        uuid: "text_decoration_none",
        name: "name",
        applicationId: "1",
        component_type: ComponentType.IconButton,
        styleHandlers: {},
        ...COMMON_ATTRIBUTES,
        parameters: {
            icon: "xmark",
        },

        event: {
            click: /* js */ `
           
           try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    updateStyle(currentComponent, "text-decoration", "none");
        
                }
            }catch(error){
                console.log(error);
            }
            
      `
        },
    },
]