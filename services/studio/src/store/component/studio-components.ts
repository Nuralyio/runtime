import { ComponentType } from "./interface";
import { COMMON_ATTRIBUTES } from "./helper/common_attributes";
import studioFontColorBlock from './text-labels-blocks/studio-font-color-block';
import studioAlignementBlock from './text-labels-blocks/studio-alignement-block';
import studioVerticalAlignementBlock from './text-labels-blocks/studio-vertical-alignement-block'
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
import studioDisplayBlock from "./common-blocks/studio-display-block";
import studioHelperTextBlock from "./common-blocks/studio-helper-block";
import studioStateBlock from "./common-blocks/studio-state-block";
import studioStatusBlock from "./common-blocks/studio-status-block";
import studioSizeBlock from "./common-blocks/studio-size-block";
import studioPlaceholderBlock from "./common-blocks/studio-placeholder-block";
import studioValueBlock from "./common-blocks/studio-value-block";
import studioPositionBlock from './common-blocks/studio-position-block'
import studioWidthBlock from './common-blocks/studio-width-block'
import studioHeightBlock from "./common-blocks/studio-height-block";
import studioButtonTypeBlock from "./button-blocks/studio-button-type-block";
import studioButtonIconPosition from './button-blocks/studio-button-icon-position-block'
import studioIconPickerBlock from './common-blocks/studio-icon-picker-block'
import studioButtonClickEventBlock from "./button-blocks/studio-button-click-event-block";
import studioInputLabelColor from "./text-input-blocks/studio-input-label-color"
import studioInputLabelSize from './text-input-blocks/studio-input-label-size' 
import studioInputHelperColor from './text-input-blocks/studio-input-helper-color'
import studioInputHelperSize from './text-input-blocks/studio-input-helper-size'
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
import studioSelectHelperColor from './select-blocks/studio-select-helper-color-block';
import studioSelectHelperSize from './select-blocks/studio-select-helper-size-block';
import studioSelectLabelColor from './select-blocks/studio-select-label-color-block';
import studioSelectLabelSize from './select-blocks/studio-select-label-size-block';
import studioSelectTypeBlock from "./select-blocks/studio-select-type-block";
import studioSelectSelectionmodeBlock from "./select-blocks/studio-select-selectionmode-block";
import studioSelectChangedEventBlock from "./select-blocks/studio-select-changed-event-block";
import stduioTable from "./table-block/columns-block";
import tableSelectionModeBlock from './table-block/table-selectionmode-block'
import tableFilterBlock from './table-block/table-filter-block'
import studioIconWidthBlock from './icon-blocks/studio-icon-width-block';
import studioIconHeightBlock from './icon-blocks/studio-icon-height-block';
import studioIconColorBlock from './icon-blocks/studio-icon-color-block';
import  QuickActions from "../editor-micro-apps/quick-action"
import studioCheckboxChangedEventBlock from "./checkbox-blocks/studio-checkbox-changed-event-block";
import studioLabelBlock from "./common-blocks/studio-label-block";
import studioSelectValuesBlock from './select-blocks/studio-select-values-block'
import studioTableValuesBlock from './table-block/table-values-block'
import studioPageNameBlock from './page-blocks/studio-page-name-block'
import studioPageUrlBlock from "./page-blocks/studio-page-url-block"
import studioTableSelectEvent from './table-block/studio-table-select-event'
import studioTableSearchEvent from './table-block/studio-table-search-event'
import studioTableSortEvent from './table-block/studio-table-sort-event'
import studioTablePaginateEvent from './table-block/studio-table-paginate-event'
import microAppSelectionBlocks from "./microapp-blocks/micro-app-selection-blocks";
import microAppContainerBlocks from "./microapp-blocks/micro-app-container-blocks";
import collectionContainerBlocks from "./collection-blocks/collection-blocks-container";
import collectionDataBlocks from "./collection-blocks/collection-blocks-data";
import TopBar from '../editor-micro-apps/top-bar'
import LeftPanel from '../editor-micro-apps/left-panel'

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
        style:{
            width:"300px",
            "--hybrid-menu-border" : "none",
        },
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
                const currentPageId = GetVar("currentPage");
                const currentEditingApplication = GetVar("currentEditingApplication");
                let parameters;
                if(selectedComponents.length)
                    { 
                        const component = GetComponent(selectedComponents[0],currentEditingApplication.uuid);
                    switch(component.component_type){
                        case "text_label":
                            parameters=[
                                "value_text_block",
                                "font_size_vertical_container",
                                "font_color_block",
                                "font_family_block",
                                "text_alignement_block",
                                "text_vertical_alignement_block",
                                "position_collapse_container",
                                "width_vertical_container",
                                "height_vertical_container",
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
                                "input_label_color_block",
                                "input_label_font_size_vertical_container",
                                "input_helper_color_block",
                                "input_helper_font_size_vertical_container",
                                "placeholder_text_block",
                                "position_collapse_container",
                                "width_vertical_container",
                                "size_block",
                                "input_type_block",
                                "status_block",
                                "state_block",
                                "input_blur_event_block",
                                "input_valuechange_event_block",
                                "input_focus_event_block"
                            ];
                            break;
                        case "button_input":
                            parameters=[
                                'label_text_block',
                                "position_collapse_container",
                                'size_block',
                                'button_type_block',
                                'icon_picker_block',
                                'state_block',
                                'button_click_event_block',
                                'display_block',
                                'button_icon_position_block'
                            ];
                            break;
                        case "checkbox":
                            parameters=[
                                'label_text_block',
                                'checkbox_checked_block',
                                'position_collapse_container',
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
                                'position_collapse_container',
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
                                'position_collapse_container',
                                'width_vertical_container',
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
                                "select_helper_color_block",
                                "select_helper_font_size_vertical_container",
                                "select_label_color_block",
                                "select_label_font_size_vertical_container",
                                'select_values_handler_block',
                                'position_collapse_container',
                                'width_vertical_container',
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
                                'table_values_handler_block',
                                "box_shadow_block", 
                                "font_family_block", 
                                "font_size_vertical_container",
                                'position_collapse_container',
                                'width_vertical_container',
                                'table_selectionmode_block',
                                'table_filter_block',
                                "table_select_event_block",
                                "table_search_event_block",
                                "table_sort_event_block",
                                "table_paginate_event_block"
                            ];
                            break;
                        case "Icon":
                            parameters=[
                                'icon_picker_block',
                                'icon_width_vertical_container',
                                'icon_height_vertical_container',
                                'position_collapse_container',
                                'icon_color_block'
                            ];
                            break;
                        case "vertical-container-block":
                            parameters=[
                                "position_collapse_container",
                                "width_vertical_container",
                                "height_vertical_container", 
                            ]
                            break;

                        case "Collection":
                            parameters=[
                                "collection_data",
                            ]
                            break;
                    }
                }
                else if(currentPageId) {
                        parameters=[
                            "page_name_block", 
                            "page_url_block"    
                        ]
                }
                return [
                    {
                        label: {
                            type: "text",
                            value: "Design"
                        },
                        childrends: {
                            type: "componentIdArray",
                            value: selectedComponents.length|| currentPageId
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
        }
    },
    
    {
        uuid: "select_component_text",
        name: "text_label",
        component_type: ComponentType.TextLabel,
        ...COMMON_ATTRIBUTES,
        applicationId: "1",
        input:{
            value:{
                type:'handler',
                value:/* js */`
                const selectComponentText=' ';
                return selectComponentText;
                
                `
            }
        },
    },
    ...studioPageNameBlock,
    ...studioPageUrlBlock,
    ...studioTableValuesBlock,
    ...stduioTable,
    ...tableSelectionModeBlock,
    ...tableFilterBlock,
    ...studioValueBlock,
    ...studioDatepickerLocaleBlock,
    ...studioDatepickerFormatBlock,
    ...studioFontSizeBlock,
    ...studioFontColorBlock,
    ...studioFontFamilyBlock,
    ...studioBackgroundcolorBlock,
    ...studioAlignementBlock,
    ...studioVerticalAlignementBlock,
    ...studioWidthBlock,
    ...studioHeightBlock,
    ...studioFontWeightBlock,
    ...studioFontStyleBlock,
    ...studioTextDecorationBlock,
    ...studioBoxShadowBlock,
    ...studioBorderRadiusBlock,
    ...studioLetterSpacingBlock,
    ...studioLineHeightBlock,
    ...studioDisplayBlock,
    ...studioPlaceholderBlock,
    ...studioHelperTextBlock,
    ...studioInputHelperColor,
    ...studioSelectHelperColor, 
    ...studioInputHelperSize, 
    ...studioSelectHelperSize, 
    ...studioLabelBlock,
    ...studioSelectLabelColor,
    ...studioInputLabelColor,
    ...studioInputLabelSize,
    ...studioSelectLabelSize,
    ...studioSelectValuesBlock,
    ...studioStatusBlock,
    ...studioSizeBlock,
    ...studioInputTypeBlock,
    ...studioStateBlock,
    ...studioButtonTypeBlock,
    ...studioIconPickerBlock,
    ...studioPositionBlock,
    ...studioButtonIconPosition,
    ...studioClickEvent,
    ...studioMouseEnterEvent,
    ...studioMouseLeaveEvent,
    ...studioIconWidthBlock,
    ...studioIconHeightBlock,
    ...studioIconColorBlock,
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
    ...studioTableSelectEvent,
    ...studioTableSearchEvent,
    ...studioTableSortEvent,
    ...studioTablePaginateEvent,
    ...QuickActions,
    ...microAppSelectionBlocks,
    ...microAppContainerBlocks,
    ...collectionContainerBlocks,
    ...collectionDataBlocks,
    ...TopBar,
    ...LeftPanel
]
