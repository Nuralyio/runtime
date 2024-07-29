import { ComponentType } from "./interface";
import studioFontColorBlock from './text-labels-blocks/studio-font-color-block';
import { COMMON_ATTRIBUTES } from './common_attributes';
import studioAlignementBlock from './text-labels-blocks/studio-alignement-block';
import studioFontWeightBlock from './text-labels-blocks/studio-font-weight-block';
import studioFontStyleBlock from './text-labels-blocks/studio-font-style-block';
import studioTextDecorationBlock from './text-labels-blocks/studio-text-decoration-block';
import studioBackgroundcolorBlock from './text-labels-blocks/studio-backgroundcolor-block';
import studioBoxShadowBlock from './text-labels-blocks/studio-box-shadow-block';
import studioBorderRadiusBlock from './text-labels-blocks/studio-border-radius-block';
import studioFontFamilyBlock from './text-labels-blocks/studio-font-family-block';
import studioFontSizeBlock from './text-labels-blocks/studio-font-size-block';
import studioLetterSpacingBlock from "./text-labels-blocks/studio-letter-spacing-block";
import studioLineHeightBlock from "./text-labels-blocks/studio-line-height-block";
import studioClickEvent from "./text-labels-blocks/studio-click-event";
import studioTextValueBlock from "./text-labels-blocks/studio-text-value-block";

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
                                ? ["text_value_vertical_container",
                                    "font_size_vertical_container",
                                    "font_color_block",
                                    "text_alignement_block",
                                    "font_family_block",
                                    "font_weight_block",
                                    "font_style_block",
                                    "text_decoration_block",
                                    "box_shadow_block",
                                    "border_radius_block",
                                    "letter_spacing_block", 
                                    "line_height_block",
                                    "click_event_block"
                                ]
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
    ...studioTextValueBlock,
    ...studioFontSizeBlock,
    ...studioFontColorBlock,
    ...studioFontFamilyBlock,
    ...studioBackgroundcolorBlock,
    ...studioAlignementBlock,
    ...studioFontWeightBlock,
    ...studioFontStyleBlock,
    ...studioTextDecorationBlock,
    ...studioBoxShadowBlock,
    ...studioBorderRadiusBlock,
    ...studioLetterSpacingBlock,
    ...studioLineHeightBlock,
    ...studioClickEvent
    
]
