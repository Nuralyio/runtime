import { ComponentType } from "./interface";
import { COMMON_ATTRIBUTES } from "./helper/common_attributes";
import studioFontColorBlock from './text-labels-blocks/studio-font-color-block';
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
import studioMouseEnterEvent from "./text-labels-blocks/studio-mouse-enter-event";
import studioMouseLeaveEvent from "./text-labels-blocks/studio-mouse-leave-event";
import studioTextValueBlock from "./text-labels-blocks/studio-text-value-block";
import studioDisplayBlock from "./common-blocks/studio-display-block";
import studioHelperTextBlock from "./common-blocks/studio-helper-block";
import studioStateBlock from "./common-blocks/studio-state-block";
import studioStatusBlock from "./common-blocks/studio-status-block";
import studioSizeBlock from "./common-blocks/studio-size-block";
import studioPlaceholderBlock from "./common-blocks/studio-placeholder-block";
import studioValueBlock from "./common-blocks/studio-value-block";
import studioButtonTypeBlock from "./button-blocks/studio-button-type-block";
import studioButtonClickEventBlock from "./button-blocks/studio-button-click-event-block";
import studioInputBlurEvent from "./text-input-blocks/studio-input-blur-event";
import studioInputClearEvent from "./text-input-blocks/studio-input-clear-event";
import studioInputValuechangeEvent from "./text-input-blocks/studio-input-valuechange-event";
import studioInputFocusEvent from "./text-input-blocks/studio-input-focus-event";
import studioCheckboxCheckedBlock from "./checkbox-blocks/studio-checkbox-checked-block";
import studioImageWidthBlock from "./image-blocks/studio-image-width-block";
import studioImageHeightBlock from "./image-blocks/studio-image-height-block";
import studioImageAltBlock from "./image-blocks/studio-image-alt-block";
import studioImageSrcBlock from "./image-blocks/studio-image-src-block";
import studioImageFallbackBlock from "./image-blocks/studio-image-fallback-block";
import studioDatepickerLocaleBlock from "./datepicker-blocks/studio-datepicker-locale-block";
import studioDatepickerFormatBlock from "./datepicker-blocks/studio-datepicker-format-block";
import studioDatepickerDateChangeEventBlock from "./datepicker-blocks/studio-datepicker-date-change-event-block";
import studioInputTypeBlock from "./text-input-blocks/studio-input-type-block";
import studioSelectTypeBlock from "./select-blocks/studio-select-type-block";
import studioSelectSelectionmodeBlock from "./select-blocks/studio-select-selectionmode-block";
import studioSelectChangedEventBlock from "./select-blocks/studio-select-changed-event-block";
import stduioTable from "./table-block/columns-block";
import tableSelectionModeBlock from './table-block/table-selectionmode-block'
import tableFilterBlock from './table-block/table-filter-block'
import  QuickActions from "../editor-micro-apps/quick-action"
import studioCheckboxChangedEventBlock from "./checkbox-blocks/studio-checkbox-changed-event-block";
import studioLabelBlock from "./common-blocks/studio-label-block";
export default [

    ...QuickActions,
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
        name: "left_panel_tabs",
        component_type: ComponentType.Tabs,

        event: {
            valueChange: `
        updateStyle(app1.text_label, "color", EventData.value);
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
        input: {
            direction: "vertical",
        },
        style:{
            width: "100%",
            height: "100%",
            display: "grid"
        },
        childrenIds: ["left_panel_tabs"],
    },


    // pages component 
    {
        uuid: "pages_panel",
        applicationId: "1",
        name: "Pages panel",
        component_type: ComponentType.VerticalContainer,
        input: {
            direction: "vertical",
        },

        style: {
            width: "225px",
            height : "100%"
        },
        childrenIds: ["btn_1", "menu_1", "btn_2"],
    },
    {
        uuid: "btn_2",
        name: "text_label",
        component_type: ComponentType.Button,
        ...COMMON_ATTRIBUTES,
        input: {
            label: {
                type: 'handler',
                value: /* js */`
                const demoLabelBtn='Demo button';
                demoLabelBtn;
            `
            }
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
            label: {
                type: 'handler',
                value: /* js */`
                const addPageLabelBtn='Add Page';
                addPageLabelBtn;
            `
            }

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
                }else{
                    SetVar("selectedComponents",[ EventData.id])
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
                        if(componentIds?.length){
                            componentIds.map((componentId) => {
                                const component= GetComponent(componentId,appId);
                                if(component){
                                    children.push({
                                        text: component.name,
                                        id: component.uuid,
                                        handlerKey : "onSelect",
                                    })
                                    const childrenIds = component.childrenIds;
                                    if(childrenIds?.length){
                                        children[children.length-1]={...children[children.length-1],children:[]};
                                        //findChildren(appId,children[children.length-1].children,childrenIds)
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
        name: "right_panel_tabs",
        component_type: ComponentType.Tabs,
        event: {
            valueChange: `
                updateStyle(app1.text_label, "color", EventData.value);
            `
        },
        style:{
            width : "100%",
            height : "100%",
            disply: "grid"
        },
        input: {
            tabs: {
                type: "handler",
                value: /* js */ `
                const selectedComponents = GetVar("selectedComponents") || [];
                const currentEditingApplication = GetVar("currentEditingApplication");
                let parameters;
                if(selectedComponents.length)
                {
                    const component = GetComponent(selectedComponents[0],currentEditingApplication.uuid);
                    console.log('component type ', component.component_type)
                    switch(component.component_type){
                        case "text_label":
                            parameters=[
                                "value_text_block",
                                "font_size_vertical_container",
                                "font_color_block",
                                "font_family_block",
                                "text_alignement_block",
                                "font_weight_block",
                                "font_style_block",
                                "text_decoration_block",
                                "box_shadow_block",
                                "border_radius_vertical_container",
                                "letter_spacing_block", 
                                "line_height_block",
                                "display_block",
                                "click_event_block",
                                "mouse_enter_event_block",
                                "mouse_leave_event_block"
                            ];
                            break;
                        case "text_input":
                            parameters=[
                                "value_text_block",
                                "helper_text_block",
                                "label_text_block",
                                "placeholder_text_block",
                                "size_block",
                                "input_type_block",
                                "status_block",
                                "state_block",
                                "input_blur_event_block",
                                "input_clear_event_block",
                                "input_valuechange_event_block",
                                "input_focus_event_block"
                            ];
                            break;
                        case "button_input":
                            parameters=[
                                'label_text_block',
                                'size_block',
                                'button_type_block',
                                'state_block',
                                'button_click_event_block',
                                'display_block'
                            ];
                            break;
                        case "checkbox":
                            parameters=[
                                'label_text_block',
                                'checkbox_checked_block',
                                'state_block',
                                'size_block',
                                "checkbox_changed_event_block",
                                "display_block"
                                ];
                                break;
                        case "Image":
                            parameters=[
                                'image_width_vertical_container',
                                'image_height_vertical_container',
                                'image_alt_text_block',
                                'image_src_text_block',
                                'image_fallback_text_block'
                                        ];
                                        break;
                        case "DatePicker":
                            parameters=[
                                "value_text_block",
                                'datepicker_locale_block',
                                'size_block',
                                'status_block',
                                'state_block',
                                "helper_text_block",
                                "label_text_block",
                                "datepicker_format_block",
                                "datepicker_date_change_event_block",
                                        ];
                                        break;
                        case "select":
                            parameters=[
                                'placeholder_text_block',
                                "helper_text_block",
                                "label_text_block",
                                'status_block',
                                'state_block',
                                'size_block',
                                'select_type_block',
                                'select_selectionmode_block',
                                'select_changed_event_block'
                            ]
                            break;
                        
                        case "Table":
                            parameters=[
                                'table_columns_block',
                                'size_block',
                                'table_selectionmode_block',
                                'table_filter_block'
                            ];
                            break;
                        
                        

                    }
                }
                [
                    {
                        label: {
                            type: "text",
                            value: "Design"
                        },
                        childrends: {
                            type: "componentIdArray",
                            value: selectedComponents.length
                                ? parameters
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
    ...stduioTable,
    ...tableSelectionModeBlock,
    ...tableFilterBlock,
    ...studioValueBlock,
    ...studioDatepickerLocaleBlock,
    ...studioDatepickerFormatBlock,
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
    ...studioDisplayBlock,
    ...studioClickEvent,
    ...studioMouseEnterEvent,
    ...studioMouseLeaveEvent,
    ...studioPlaceholderBlock,
    ...studioHelperTextBlock, 
    ...studioLabelBlock,
    ...studioStatusBlock,
    ...studioSizeBlock,
    ...studioInputTypeBlock,
    ...studioStateBlock,
    ...studioButtonTypeBlock,
    ...studioInputBlurEvent,
    ...studioInputClearEvent,
    ...studioInputValuechangeEvent,
    ...studioInputFocusEvent,
    ...studioButtonClickEventBlock,
    ...studioCheckboxCheckedBlock,
    ...studioImageWidthBlock,
    ...studioImageHeightBlock,
    ...studioImageAltBlock,
    ...studioImageSrcBlock,
    ...studioImageFallbackBlock,
    ...studioDatepickerDateChangeEventBlock,
    ...studioCheckboxChangedEventBlock,
    ...studioSelectTypeBlock,
    ...studioSelectSelectionmodeBlock,
    ...studioSelectChangedEventBlock,
]
