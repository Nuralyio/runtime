import { ComponentType } from "./interface";


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
            tabs: [
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
                console.log(currentEditingApplication, currentEditingApplication.uuid + ".appPages");
                const appPages = GetContextVar(currentEditingApplication.uuid + ".appPages", currentEditingApplication.uuid);
                console.log(appPages);
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
                type: "text",
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
                console.log(currentEditingApplication, currentEditingApplication.uuid + ".appPages");
                const appPages = GetContextVar(currentEditingApplication.uuid + ".appPages", currentEditingApplication.uuid);
                console.log(appPages);
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
                console.log("onSesslect", EventData)
                SetVar("currentPage", EventData.id);
                `
            },

            options: {
                type: "handler",
                value: /* js */ `
                const currentEditingApplication = GetVar("currentEditingApplication");
                const appPages = GetContextVar(currentEditingApplication.uuid + ".appPages", currentEditingApplication.uuid);
                console.log(appPages)
                if(!appPages) {
                     [];
                }else{
                    appPages.map((page, index) => {
                        return {
                            label: page.name,
                            id: page.uuid,
                            handlerKey : "onSelect",
                            children: [
                                {
                                    label: "Edit",
                                    id: "edit",
                                    handlerKey : "onSelect"
                                },
                                {
                                    label: "Delete",
                                    id: "delete",
                                    handlerKey: "onSelect"
                                }
                            ]
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
            tabs: [
                {
                    label: {
                        type: "text",
                        value: "Design"
                    },
                    childrends: {
                        type: "componentIdArray",
                        value: ["input_text_vertical_container", "font_color_block"]

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
                },
            ]
        },
    },
    {
        uuid: "input_text_vertical_container",
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
        uuid: "font_size_input_2",
        name: "name",
        applicationId: "1",
        component_type: ComponentType.TextInput,
        parameters: {
            value: "22px",
        },
        event: {
            valueChange: /* js */ `
           
           try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    updateStyle(currentComponent, "fontSize", EventData.value);
                
                }
            }catch(error){
                console.log(error);
            }
            
      `
        },
        ...COMMON_ATTRIBUTES,
        inputHandlers: {
            value: /* js */`
            try{
            const selectedComponens =  GetVar( "selectedComponents")||[];
            if( selectedComponens.length) {
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                console.log('currentComponentrrr', currentComponent);
                currentComponent.style?.fontSize || "22px";
            }

        }catch(e){
            console.log(e);
        }
            `
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
        component_type: ComponentType.TextInput,
        parameters: {
            value: "22px",
        },
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
        inputHandlers: {
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
    },
    //
]
