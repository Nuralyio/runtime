import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../common_attributes";
export default [
    {
        uuid: "display_block",
        applicationId: "1",
        name: "Left panel",
        component_type: ComponentType.VerticalContainer,
        styleHandlers: {},
        ...COMMON_ATTRIBUTES,
        style: {
            width: "220px",
            'margin-top': '10px',
            display:'flex',
            'justify-content':'space-between',
        },
        
        childrenIds: ["text_label_display", "display_content"],
    },
    {
        uuid: "text_label_display",
        name: "text_label",
        component_type: ComponentType.TextLabel,
        parameters: {
            value: "Display",
        },

        applicationId: "1",
        ...COMMON_ATTRIBUTES,
    },
    {
        uuid: "display_content",
        applicationId: "1",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "Left panel",
        style: {
                display:'block',
                width: "250px", 
        },
        input: { 
            value: {
                type: 'handler',
                value: /* js */`
                const event ='click';
                event;
            `
            }
        },
        childrenIds: ["display_yes", "display_no"]
    },
    {
        uuid: "display_yes",
        name: "name",
        applicationId: "1",
        component_type: ComponentType.IconButton,
        styleHandlers: {},
        ...COMMON_ATTRIBUTES,
        parameters: {
            icon: "eye",
        },

        event: {
            click: /* js */ `
           try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    currentComponent.parameters.display =true;

                }
            }catch(error){
                console.log(error);
            }      
      `
        },
        input: {
            value:{
                type:'handler',
                value: /* js */`
                 try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if(selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)                    
                    currentComponent.parameters.display =true;
                }
    
            }catch(e){
                console.log(e);
            }
                `
            } 
            
           
        }
        
    },
    {
        uuid: "display_no",
        name: "name",
        applicationId: "1",
        component_type: ComponentType.IconButton,
        styleHandlers: {},
        ...COMMON_ATTRIBUTES,
        parameters: {
            icon: "eye-slash",
        },

        event: {
            click: /* js */ `
           try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    currentComponent.parameters.display = false;
                    console.log('current component ',currentComponent)
                }
            }catch(error){
                console.log(error);
            }`
        },
        input: {
            value: {
                type:'handler',
                value:  /* js */`
                try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if(selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)                    
                    currentComponent.parameters.display = true;
                    console.log('current component from handler ',currentComponent)

                }
    
            }catch(e){
                console.log(e);
            }
                `
            }
            
           
        }
        
    },
] 
