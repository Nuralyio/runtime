import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../common_attributes";
export default [
    {
        uuid: "text_alignement_block",
        applicationId: "1",
        name: "Left panel",
        component_type: ComponentType.VerticalContainer,
        styleHandlers: {},
        input: {
            direction: "vertical",
        },
        ...COMMON_ATTRIBUTES,
        style: {

        },

        childrenIds: ["alignement_label_container", "alignement_content_container"],
    },
    {
        uuid: "alignement_label_container",
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
        },
        childrenIds: ["text_label_alignement"],
    },
    {
        uuid: "alignement_content_container",
        applicationId: "1",
        name: "Left panel",
        component_type: ComponentType.VerticalContainer,
        styleHandlers: {},
        input: {
            direction: "vertical",
        },

        ...COMMON_ATTRIBUTES,
        style: {
            width: "280px",
            display: 'flex',
            'justify-content': 'space-between'
        },
        childrenIds: ["text-align-left", "text-align-center", "text-align-right", "text-align-justify", "text-align-top", "text-align-bottom"],
    },
    {
        uuid: "text_label_alignement",
        name: "text_label",
        component_type: ComponentType.TextLabel,
        parameters: {
            value: "Alignement",
        },
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        style: {

        }

    },
    {
        uuid: "text-align-left",
        name: "name",
        applicationId: "1",
        component_type: ComponentType.IconButton,
        styleHandlers: {},
        ...COMMON_ATTRIBUTES,
        parameters: {
            icon: "align-left",
        },

        event: {
            click: /* js */ `
           
           try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    updateStyle(currentComponent, "text-align", "left");
        
                }
            }catch(error){
                console.log(error);
            }
            
      `
        },
        inputHandlers: {
            value: /* js */`
            try{
            const selectedComponens =  GetVar( "selectedComponents")||[];
            if( selectedComponens.length) {
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                currentComponent.style['text-align']|| "right";
            }

        }catch(e){
            console.log(e);
        }
            `
        }
    },
    {
        uuid: "text-align-right",
        name: "name",
        applicationId: "1",
        component_type: ComponentType.IconButton,
        styleHandlers: {},
        ...COMMON_ATTRIBUTES,
        parameters: {
            icon: "align-right",
        },

        event: {
            click: /* js */ `
           
           try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    updateStyle(currentComponent, "text-align", "right");
        
                }
            }catch(error){
                console.log(error);
            }
            
      `
        },
        inputHandlers: {
            value: /* js */`
            try{
            const selectedComponens =  GetVar( "selectedComponents")||[];
            if( selectedComponens.length) {
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                currentComponent.style['text-align']|| "right";
            }

        }catch(e){
            console.log(e);
        }
            `
        }
    },
    {
        uuid: "text-align-center",
        name: "name",
        applicationId: "1",
        component_type: ComponentType.IconButton,
        styleHandlers: {},
        ...COMMON_ATTRIBUTES,
        parameters: {
            icon: "align-center",
        },

        event: {
            click: /* js */ `
           
           try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    updateStyle(currentComponent, "text-align", "center");
        
                }
            }catch(error){
                console.log(error);
            }
            
      `
        },
        inputHandlers: {
            value: /* js */`
            try{
            const selectedComponens =  GetVar( "selectedComponents")||[];
            if( selectedComponens.length) {
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                currentComponent.style['text-align']|| "right";
            }

        }catch(e){
            console.log(e);
        }
            `
        }
    },
    {
        uuid: "text-align-justify",
        name: "name",
        applicationId: "1",
        component_type: ComponentType.IconButton,
        styleHandlers: {},
        ...COMMON_ATTRIBUTES,
        parameters: {
            icon: "align-justify",
        },

        event: {
            click: /* js */ `
           
           try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    updateStyle(currentComponent, "text-align", "justify");
        
                }
            }catch(error){
                console.log(error);
            }
            
      `
        },
        inputHandlers: {
            value: /* js */`
            try{
            const selectedComponens =  GetVar( "selectedComponents")||[];
            if( selectedComponens.length) {
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                currentComponent.style['text-align']|| "right";
            }

        }catch(e){
            console.log(e);
        }
            `
        }
    },
    {
        uuid: "text-align-top",
        name: "name",
        applicationId: "1",
        component_type: ComponentType.IconButton,
        styleHandlers: {},
        ...COMMON_ATTRIBUTES,
        parameters: {
            icon: "arrow-up",
        },

        event: {
            click: /* js */ `
           
           try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    updateStyle(currentComponent, "display", "inline-block");
                    updateStyle(currentComponent, "vertical-align", "top");

                }
            }catch(error){
                console.log(error);
            }
            
      `
        },
        inputHandlers: {
            value: /* js */`
            try{
            const selectedComponens =  GetVar( "selectedComponents")||[];
            if( selectedComponens.length) {
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                currentComponent.style['vertical-align']|| "top";
            }

        }catch(e){
            console.log(e);
        }
            `
        }
    },
    {
        uuid: "text-align-bottom",
        name: "name",
        applicationId: "1",
        component_type: ComponentType.IconButton,
        styleHandlers: {},
        ...COMMON_ATTRIBUTES,
        parameters: {
            icon: "arrow-down",
        },

        event: {
            click: /* js */ `
           
           try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    updateStyle(currentComponent, "display", "inline-block");
                    updateStyle(currentComponent, "vertical-align", "bottom");

                }
            }catch(error){
                console.log(error);
            }
            
      `
        },
        inputHandlers: {
            value: /* js */`
            try{
            const selectedComponens =  GetVar( "selectedComponents")||[];
            if( selectedComponens.length) {
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                currentComponent.style['vertical-align']|| "top";
            }

        }catch(e){
            console.log(e);
        }
            `
        }
    },

] 
