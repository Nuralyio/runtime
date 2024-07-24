import { log } from '@nanostores/logger';
import { ComponentType } from "./interface";
import { $componentWithChildrens } from '$store/component/sotre';


const COMMON_ATTRIBUTES = {
    input: {},
    inputHandlers: {},
    style: {},
    styleHandlers: {},
    styleBreakPoints: {
        mobile: {},
        tablet: {},
        laptop: {},
    },
    attributesHandlers: {},
    errors: {},
    childrenIds: [],
}
export default [

    {
        uuid: "1",
        name: "text_label",
        component_type: ComponentType.TextLabel,
        parameters: {
            value: "Font Size",
        },

        event: {
            onClick: `
        console.log("Clicked 22" , Current.uuid);
      `
        },
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        inputHandlers: {
            value: ` GetContextVar("text_label_value");`
        },

    },
    {
        uuid: "2",
        name: "name",
        applicationId: "1",
        component_type: ComponentType.TextInput,
        parameters: {
            value: "22px",
        },
        event: {
            valueChange: `
            try{
            SetContextVar("text_label_value", EventData.value);
            updateStyle(app1.text_label, "color", EventData.value);
            console.log(GetContextVar("text_label_value"));
            }catch(e){
                console.log(e);
            }
      `
        },
        ...COMMON_ATTRIBUTES
    },
    {
        uuid: "left_panel_tabs",
        applicationId: "1",
        name: "name",
        component_type: ComponentType.Tabs,
        parameters: {
            value: "22px",
        },

        event: {
            valueChange: `
        updateStyle(app1.text_label, "color", EventData.value);
        console.log("app1",app1);
      `
        },
        ...COMMON_ATTRIBUTES,
        input: {
            tabs: {
                type: "json",
                value:
                    [
                        {
                            label: {
                                type: "text",
                                value: "Pages"
                            },
                            childrends: {
                                type: "componentIdArray",
                                value: ["pages_panel"]

                            }
                        },
                        {
                            label: {
                                type: "text",
                                value: "Data Source"
                            },
                            childrends: {
                                type: "componentIdArray",
                                value: ["2"]

                            }
                        },
                    ]
            }
        },
    },
    {
        uuid: "331",
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
        childrenIds: ["left_panel_tabs"],
    },


    // pages component 
    {
        uuid: "pages_panel",
        applicationId: "1",
        name: "Pages panel",
        component_type: ComponentType.VerticalContainer,
        styleHandlers: {},
        input: {
            direction: "vertical",
        },

        ...COMMON_ATTRIBUTES,
        style: {
            width: "250px",
        },
        childrenIds: ["btn_1", "menu_1", "btn_2"],
    },
    {
        uuid: "btn_2",
        name: "text_label",
        component_type: ComponentType.Button,
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                type: "text",
                value: "Demo button"
            },

            // show : {
            //     type: "hander",
            //     value:  /* js */ `
            //         const currentEditingApplication = GetVar("currentEditingApplication");
            //         const appPages = GetContextVar(currentEditingApplication.uuid + ".appPages", currentEditingApplication.uuid);
            //         if(!appPages) {
            //             false;
            //         }
            //         appPages?.length;
            //     `
            // }
        },

        event: {
            /* js */
            onClick: `
            try {
                const currentEditingApplication = GetVar("currentEditingApplication");
                const appPages = GetContextVar(currentEditingApplication.uuid + ".appPages", currentEditingApplication.uuid);
                const newPage = {
                    name: "Page_" + (appPages.length + 1),
                    url: ("Page_" + (appPages.length + 1)).toLowerCase(),
                    component_ids : []
                };
                AddPage(newPage, currentEditingApplication.uuid).then(() => {
                    console.log("Page added");
                }).catch((e) => {
                    console.error(e);
                })
             } catch(e) {
                 console.log(e);
             }
             `
            /* end */
        },
        applicationId: "1",
        inputHandlers: {
            value: ` GetContextVar("text_label_value");`
        },

    },
    {
        uuid: "btn_1",
        name: "text_label",
        component_type: ComponentType.Button,
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                value: "Add Page"
            },

            // show : {
            //     type: "hander",
            //     value:  /* js */ `
            //         const currentEditingApplication = GetVar("currentEditingApplication");
            //         const appPages = GetContextVar(currentEditingApplication.uuid + ".appPages", currentEditingApplication.uuid);
            //         if(!appPages) {
            //             false;
            //         }
            //         appPages?.length;
            //     `
            // }
        },

        event: {
            /* js */
            onClick: `
            try {
                const currentEditingApplication = GetVar("currentEditingApplication");
                const appPages = GetContextVar(currentEditingApplication.uuid + ".appPages", currentEditingApplication.uuid);
                const newPage = {
                    name: "Page_" + (appPages.length + 1),
                    url: ("Page_" + (appPages.length + 1)).toLowerCase(),
                    component_ids : []
                };
                AddPage(newPage, currentEditingApplication.uuid).then(() => {
                    console.log("Page added");
                }).catch((e) => {
                    console.error(e);
                })
             } catch(e) {
                 console.log(e);
             }
             `
            /* end */
        },
        applicationId: "1",
        inputHandlers: {
            value: ` GetContextVar("text_label_value");`
        },

    },
    {
        uuid: "menu_1",
        name: "menu",
        component_type: ComponentType.Menu,
        ...COMMON_ATTRIBUTES,
        input: {
            onSelect: {
                type: "handler",
                value: /* js */ `
                if(EventData.type === "page"){
                    SetVar("currentPage" , EventData.id)
                    //SelectPage({id : EventData.page.id}) 
                }
                `
            },

            options: {
                type: "handler",
                value: /* js */ `
                const currentEditingApplication = GetVar("currentEditingApplication");
                const appPages = GetContextVar(currentEditingApplication.uuid + ".appPages", currentEditingApplication.uuid);
                if(!appPages) {
                     [];
                }else{
                    function findChildren(appId,children,childrenIds){
                        childrenIds.map((componentId)  => {
                            const component= GetComponent(componentId,appId);
                            const componentChildrenIds = component.childrenIds;
                            children.push({
                                text: component.name,
                                id: component.uuid,
                                handlerKey: "onSelect",
                            })
                            if(componentChildrenIds.length){
                                children[children.length-1]={...children[children.length-1],children:[]}
                                findChildren(appId,children[children.length-1].children,componentChildrenIds);
                            }
                            
                        })

                    }
                    appPages.map((page, index) => {                        
                        const componentIds= page.component_ids;
                        const appId = page.application_id;
                        var children=[];
                        if(componentIds.length){
                            componentIds.map((componentId) => {
                                const component= GetComponent(componentId,appId);
                                if(component){
                                    children.push({
                                        text: component.name,
                                        id: component.uuid,
                                        handlerKey : "onSelect",
                                    })
                                    const childrenIds = component.childrenIds;
                                    if(childrenIds.length){
                                        children[children.length-1]={...children[children.length-1],children:[]};
                                        findChildren(appId,children[children.length-1].children,childrenIds)
                                    }     
                                }
                            })
                        }
                        return {
                            text: page.name,
                            id: page.uuid,
                            type: "page",
                            handlerKey : "onSelect",
                            children: children
                        }
                    });
                }
                `
            },
        },
        applicationId: "1",
    },
    {
        uuid: "right_panel_tabs",
        applicationId: "1",
        name: "name",
        component_type: ComponentType.Tabs,
        parameters: {
            value: "22px",
        },

        event: {
            valueChange: `
        updateStyle(app1.text_label, "color", EventData.value);
        console.log("app1",app1);
      `
        },
        ...COMMON_ATTRIBUTES,
        input: {
            tabs: {
                type: "handler",
                value: /* js */ `
                const selectedComponents = GetVar("selectedComponents") || [];
                [
                    {
                        label: {
                            type: "text",
                            value: "Design"
                        },
                        childrends: {
                            type: "componentIdArray",
                            value: selectedComponents.length
                                ? ["input_text_vertical_container",
                                    "font_color_block",
                                    "text_alignement_block",
                                    "font_family_block",
                                    "font_weight_block",
                                    "font_style_block",
                                    "text_decoration_block",
                                    "box_shadow_block",
                                    "border_radius_block"]
                                : ["select_component_text"]
                        }
                    },
                    {
                        label: {
                            type: "text",
                            value: "Advanced"
                        },
                        childrends: {
                            type: "componentIdArray",
                            value: []
                        }
                    }
                ];
                `
            }
        },
    },
    {
        uuid: "input_text_vertical_container",
        applicationId: "1",
        name: "Left panel",
        component_type: ComponentType.VerticalContainer,
        styleHandlers: {},
        /* 
        input: {
            direction: {
                value: "vertical",
                type : "enum",
                options: ["vertical", "horizontal"],
            },
        },
        */
        input: {
            direction: "vertical",
        },

        ...COMMON_ATTRIBUTES,
        style: {
            width: "250px",
        },
        childrenIds: ["font_size_block"],
    },
    {
        uuid: "font_size_block",
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
        childrenIds: ["text_label_font_size", "font_size_input_2"],
    },

    {
        uuid: "text_label_font_size",
        name: "text_label",
        component_type: ComponentType.TextLabel,
        parameters: {
            value: "Font Size",
        },

        event: {
            onClick:  /* js */ `
                console.log("Clicked 44" , Current);
            `
        },
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        inputHandlers: {
            value: `GetContextVar("text_label_value");`
        },

    },
    {
        uuid: "select_component_text",
        name: "text_label",
        component_type: ComponentType.TextLabel,
        parameters: {
            value: "Select Component to start",
        },
        event: {
            onClick:  /* js */ `
            `
        },
        applicationId: "1",
        ...COMMON_ATTRIBUTES,

    },
    {
        uuid: "font_size_input_2",
        name: "name",
        applicationId: "1",
        component_type: ComponentType.NumberInput,
        styleHandlers: {},
        parameters: {
            value: "22px",
        },
        ...COMMON_ATTRIBUTES,
        style: {
            width: "20px",
        },
        event: {
            valueChange: {
                type: "handler",
                value: /* js */ `
                    try{
                        const selectedComponens =  GetVar( "selectedComponents")||[];
                        if( selectedComponens.length) {
                            const selectedComponent = selectedComponens[0];
                            const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                            updateStyle(currentComponent, "fontSize", EventData.value+EventData.unity);
                        
                        }
                    }catch(error){
                        console.log(error);
                    }
                    
  `
            }
        },
        input: {
            value: {
                type: 'handler',
                value: /* js */`
            try{
            const selectedComponens =  GetVar( "selectedComponents")||[];
            if( selectedComponens.length) {
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                const fontSize =currentComponent.style['fontSize']?.split('')
                if(fontSize) 
                    {
                        let unity='';
                        let value='';
                        fontSize.forEach((char)=>
                            {
                            if(char>='0' && char<='9')
                                value+=char 
                            else 
                            unity+=char
                           }
                        );
                        [+value,unity]
                    }
                    else 
                       [0,'px']
            }

        }catch(e){
            console.log(e);
        }
            `
            }
        }
    },
    {
        uuid: "font_color_block",
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
            "flex-direction": "column",
        },
        childrenIds: ["text_label_color", "font_color_input_2"],
    },
    {
        uuid: "text_label_color",
        name: "text_label",
        component_type: ComponentType.TextLabel,
        parameters: {
            value: "Color",
        },

        event: {
            onClick: `
        console.log("Clicked 22" , Current.uuid);
      `
        },
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        inputHandlers: {
            value: `GetContextVar("text_label_value");`
        },

    },
    {
        uuid: "font_color_input_2",
        name: "name",
        applicationId: "1",
        component_type: ComponentType.ColorPicker,
        event: {
            valueChange: /* js */ `
           
           try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    updateStyle(currentComponent, "color", EventData.value);
                
                }
            }catch(error){
                console.log(error);
            }
            
      `
        },
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                type: "handler",
                value: /* js */`
                    try{
                        const selectedComponens =  GetVar( "selectedComponents")||[];
                        if( selectedComponens.length) {
                            const selectedComponent = selectedComponens[0];
                            const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                            currentComponent.style?.color || "black";
                        }

                    }catch(e){
                        console.log(e);
                    }
                `
            }
        }
    },
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
        uuid: "font_family_block",
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

        childrenIds: ["font_family_label_container", "font_family_content_container"],
    },
    {
        uuid: "font_family_label_container",
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
        childrenIds: ["font_family_label"],
    },
    {
        uuid: "font_family_label",
        name: "text_label",
        component_type: ComponentType.TextLabel,
        parameters: {
            value: "Font family",
        },
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        style: {

        }
    },
    {
        uuid: "font_family_content_container",
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
        childrenIds: ["font_family_select"],
    },
    {
        uuid: "font_family_select",
        applicationId: "1",
        component_type: ComponentType.Select,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "Left panel",
        input: {
            value: {
                type: "handler",
                value: /* js */ `                    
                [{
                    label: "Arial",
                    value: "arial"
                }, 
                {
                    label: "Tahoma",
                    value: "tahoma"
                },
                {
                     label: "Verdana",
                     value: "verdana"
                },
                {
                    label:'Georgia',
                    value:'georgia'
                },
                {
                    label:'Courier New',
                    value:'courier new'
                }
            
            ]
                
                `
            }
        },
        style: {
            width: "250px",
        },
        event: {
            changed: /* js */ `

            try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    updateStyle(currentComponent, "font-family", EventData.value);
        
                }
            }catch(error){
                console.log(error);
            }
            
      `
        },
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
        uuid: "font_weight_block",
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
            'margin-top': '10px',
        },
        childrenIds: ["text_label_font_weight", "font_weight_select"],
    },
    {
        uuid: "text_label_font_weight",
        name: "text_label",
        component_type: ComponentType.TextLabel,
        parameters: {
            value: "Font weight",
        },

        applicationId: "1",
        ...COMMON_ATTRIBUTES,
    },
    {
        uuid: "font_weight_select",
        applicationId: "1",
        component_type: ComponentType.Select,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "Left panel",
        input: {
            value: {
                type: "handler",
                value: /* js */ `                    
                [{label: "Normal",value: "normal"},{label:'Bold',value:'bold'},{label:'Extra bold',value:'800'}]
                
                `
            }
        },
        style: {
            width: "250px",
        },
        event: {
            changed: /* js */ `

            try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    updateStyle(currentComponent, "font-weight", EventData.value);
        
                }
            }catch(error){
                console.log(error);
            }
            
      `
        },
    },
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
    {
        uuid: "background_color_block",
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
        childrenIds: ["text_label_background_color", "background_color_value"],
    },
    {
        uuid: "text_label_background_color",
        name: "text_label",
        component_type: ComponentType.TextLabel,
        parameters: {
            value: "Background Color",
        },
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
    },
    {
        uuid: "background_color_value",
        name: "name",
        applicationId: "1",
        component_type: ComponentType.ColorPicker,
        event: {
            valueChange: /* js */ `
           
           try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    updateStyle(currentComponent, "background-color", EventData.value);
                
                }
            }catch(error){
                console.log(error);
            }
            
      `
        },
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                type: "handler",
                value: /* js */`
                    try{
                        const selectedComponens =  GetVar( "selectedComponents")||[];
                        if( selectedComponens.length) {
                            const selectedComponent = selectedComponens[0];
                            const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                            currentComponent.style?.backgroundColor || "#ffffff";
                        }

                    }catch(e){
                        console.log(e);
                    }
                `
            }
        }
    },
    {
        uuid: "box_shadow_block",
        name: "name",
        applicationId: "1",
        component_type: ComponentType.ShadowBox,
        styleHandlers: {},
        ...COMMON_ATTRIBUTES,
        event: {
            boxShadowChanged: {
                type: "handler",
                value: /* js */ `
                    try{
                        const selectedComponens =  GetVar( "selectedComponents")||[];
                        if( selectedComponens.length) {
                            const selectedComponent = selectedComponens[0];
                            const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                            updateStyle(currentComponent, "box-shadow",EventData.value);
                        
                        }
                    }catch(error){
                        console.log(error);
                    }      
  `
            }
        },
        input: {
            value: {
                type: 'handler',
                value: /* js */`
            try{
            const selectedComponens =  GetVar( "selectedComponents")||[];
            if( selectedComponens.length) {

                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                if (currentComponent.style["box-shadow"]) {

                    const values = currentComponent.style["box-shadow"].match(/-?\d+px/g);                    
                    const horizontalValue = parseInt(values[0], 10);
                    const verticalValue = parseInt(values[1], 10);
                    const blurValue = parseInt(values[2], 10);
                    const spreadValue = parseInt(values[3], 10);
                    const colorMatch = currentComponent.style["box-shadow"].match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})/);
                    const insetMatch = currentComponent.style["box-shadow"].match(/\binset\b/);
                    const insetValue = insetMatch[0] ? true : false;
                    const colorValue = colorMatch ? colorMatch[0] : "#000000";
                    [horizontalValue,verticalValue,blurValue,spreadValue,insetValue,colorValue]

                }
                else {
                    const horizontalValue = 0;
                    const verticalValue = 0;
                    const blurValue = 0;
                    const spreadValue = 0;
                    const colorValue = "#000000";
                    const insetValue = false;
                    [horizontalValue,verticalValue,blurValue,spreadValue,insetValue,colorValue]
                }
                
            }

        }catch(e){
            console.log(e);
        }
            `
            }
        }
    },
    {
        uuid: "border_radius_block",
        name: "name",
        applicationId: "1",
        component_type: ComponentType.BorderRadius,
        styleHandlers: {},
        ...COMMON_ATTRIBUTES,
        event: {
            borderRadiusChanged: {
                type: "handler",
                value: /* js */ `
                    try{
                        const selectedComponens =  GetVar( "selectedComponents")||[];
                        if( selectedComponens.length) {
                            const selectedComponent = selectedComponens[0];
                            const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                            updateStyle(currentComponent, "border-radius",EventData.value+EventData.unity);
                        }
                    }catch(error){
                        console.log(error);
                    }      
  `
            }
        },
        input: {
            value: {
                type: 'handler',
                value: /* js */`
            try{
            const selectedComponens =  GetVar( "selectedComponents")||[];
            if( selectedComponens.length) {
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                if (currentComponent.style["border-radius"]) {
                            let unity='';
                            let value='';
                            currentComponent.style["border-radius"].split('').forEach((char)=>
                                {  
                                if(char>='0' && char<='9')
                                    value+=char 
                                else 
                                unity+=char
                               }
                            );
                            [value,unity]
                          }
                         else 
                            [0,'px']    
                              
                
            }

        }catch(e){
            console.log(e);
        }
            `
            }
        }
    },
]
