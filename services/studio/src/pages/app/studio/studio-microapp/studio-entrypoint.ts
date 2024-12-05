import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "./helper/common_attributes.ts";
import studioFontColorBlock from "./text-labels-blocks/studio-font-color-block.ts";
import studioAlignementBlock from "./text-labels-blocks/studio-alignement-block.ts";
import studioVerticalAlignementBlock from "./text-labels-blocks/studio-vertical-alignement-block.ts";
import studioFontWeightBlock from "./text-labels-blocks/studio-font-weight-block.ts";
import studioFontStyleBlock from "./text-labels-blocks/studio-font-style-block.ts";
import studioTextDecorationBlock from "./text-labels-blocks/studio-text-decoration-block.ts";
import studioBackgroundcolorBlock from "./text-labels-blocks/studio-backgroundcolor-block.ts";
import studioBoxShadowBlock from "./text-labels-blocks/studio-box-shadow-block.ts";
import studioBorderRadiusBlock from "./text-labels-blocks/studio-border-radius-block.ts";
import studioFontFamilyBlock from "./text-labels-blocks/studio-font-family-block.ts";
import studioFontSizeBlock from "./text-labels-blocks/studio-font-size-block.ts";
import studioLetterSpacingBlock from "./text-labels-blocks/studio-letter-spacing-block.ts";
import studioLineHeightBlock from "./text-labels-blocks/studio-line-height-block.ts";
import studioClickEvent from "./text-labels-blocks/studio-click-event.ts";
import studioMouseEnterEvent from "./text-labels-blocks/studio-mouse-enter-event.ts";
import studioMouseLeaveEvent from "./text-labels-blocks/studio-mouse-leave-event.ts";
import studioDisplayBlock from "./common-blocks/studio-display-block.ts";
import studioHelperTextBlock from "./common-blocks/studio-helper-block.ts";
import studioStateBlock from "./common-blocks/studio-state-block.ts";
import studioStatusBlock from "./common-blocks/studio-status-block.ts";
import studioSizeBlock from "./common-blocks/studio-size-block.ts";
import studioPlaceholderBlock from "./common-blocks/studio-placeholder-block.ts";
import studioValueBlock from "./common-blocks/studio-value-block.ts";
import studioPositionBlock from "./common-blocks/studio-position-block.ts";
import studioWidthBlock from "./common-blocks/studio-width-block.ts";
import studioHeightBlock from "./common-blocks/studio-height-block.ts";
import studioButtonTypeBlock from "./button-blocks/studio-button-type-block.ts";
import studioButtonIconPosition from "./button-blocks/studio-button-icon-position-block.ts";
import studioIconPickerBlock from "./common-blocks/studio-icon-picker-block.ts";
import studioTypographyCollapseBlock from "./common-blocks/typography-collapse-block.ts";
import studioSizeCollpaseBlock from "./common-blocks/size-collpase-block.ts";
import studioButtonClickEventBlock from "./button-blocks/studio-button-click-event-block.ts";
import studioButtonThemeBlock from "./button-blocks/studio-button-theme-block.ts";
import studioInputLabelColor from "./text-input-blocks/studio-input-label-color.ts";
import studioInputLabelSize from "./text-input-blocks/studio-input-label-size.ts";
import studioInputHelperColor from "./text-input-blocks/studio-input-helper-color.ts";
import studioInputHelperSize from "./text-input-blocks/studio-input-helper-size.ts";
import studioInputBlurEvent from "./text-input-blocks/studio-input-blur-event.ts";
import studioInputClearEvent from "./text-input-blocks/studio-input-clear-event.ts";
import studioInputValuechangeEvent from "./text-input-blocks/studio-input-valuechange-event.ts";
import studioInputFocusEvent from "./text-input-blocks/studio-input-focus-event.ts";
import studioCheckboxCheckedBlock from "./checkbox-blocks/studio-checkbox-checked-block.ts";
import studioImageWidthBlock from "./image-blocks/studio-image-width-block.ts";
import studioImageHeightBlock from "./image-blocks/studio-image-height-block.ts";
import studioImageAltBlock from "./image-blocks/studio-image-alt-block.ts";
import studioImageSrcBlock from "./image-blocks/studio-image-src-block.ts";
import studioImageFallbackBlock from "./image-blocks/studio-image-fallback-block.ts";
import studioDatepickerLocaleBlock from "./datepicker-blocks/studio-datepicker-locale-block.ts";
import studioDatepickerFormatBlock from "./datepicker-blocks/studio-datepicker-format-block.ts";
import studioDatepickerDateChangeEventBlock from "./datepicker-blocks/studio-datepicker-date-change-event-block.ts";
import studioInputTypeBlock from "./text-input-blocks/studio-input-type-block.ts";
import studioSelectWidth from "./select-blocks/studio-select-width-block.ts";
import studioSelectHelperColor from "./select-blocks/studio-select-helper-color-block.ts";
import studioSelectHelperSize from "./select-blocks/studio-select-helper-size-block.ts";
import studioSelectLabelColor from "./select-blocks/studio-select-label-color-block.ts";
import studioSelectLabelSize from "./select-blocks/studio-select-label-size-block.ts";
import studioSelectTypeBlock from "./select-blocks/studio-select-type-block.ts";
import studioSelectSelectionmodeBlock from "./select-blocks/studio-select-selectionmode-block.ts";
import studioSelectChangedEventBlock from "./select-blocks/studio-select-changed-event-block.ts";
import stduioTable from "./table-block/columns-block.ts";
import tableSelectionModeBlock from "./table-block/table-selectionmode-block.ts";
import tableFilterBlock from "./table-block/table-filter-block.ts";
import studioIconWidthBlock from "./icon-blocks/studio-icon-width-block.ts";
import studioIconHeightBlock from "./icon-blocks/studio-icon-height-block.ts";
import studioIconColorBlock from "./icon-blocks/studio-icon-color-block.ts";
import QuickActions from "../components/editor-micro-apps/quick-action.ts";
import studioCheckboxChangedEventBlock from "./checkbox-blocks/studio-checkbox-changed-event-block.ts";
import studioLabelBlock from "./common-blocks/studio-label-block.ts";
import studioBorderCollapse from "./common-blocks/studio-border-collapse.ts";
import studioSelectValuesBlock from "./select-blocks/studio-select-values-block.ts";
import studioTableValuesBlock from "./table-block/table-values-block.ts";
import studioPageNameBlock from "./page-blocks/studio-page-name-block.ts";
import studioPageUrlBlock from "./page-blocks/studio-page-url-block.ts";
import studioTableSelectEvent from "./table-block/studio-table-select-event.ts";
import studioTableSearchEvent from "./table-block/studio-table-search-event.ts";
import studioTableSortEvent from "./table-block/studio-table-sort-event.ts";
import studioTablePaginateEvent from "./table-block/studio-table-paginate-event.ts";
import microAppSelectionBlocks from "./microapp-blocks/micro-app-selection-blocks.ts";
import microAppContainerBlocks from "./microapp-blocks/micro-app-container-blocks.ts";
import collectionContainerBlocks from "./collection-blocks/collection-blocks-container.ts";
import collectionDataBlocks from "./collection-blocks/collection-blocks-data.ts";
import TopBar from "../components/editor-micro-apps/top-bar.ts";
import LeftPanel from "../components/editor-micro-apps/left-panel.ts";

export default [

  {
    uuid: "divider",
    name: "divider",
    component_type: ComponentType.Divier,
    applicationId: "1",
    input: {}
  },
  {
    uuid: "1",
    name: "text_label",
    component_type: ComponentType.TextLabel,
    parameters: {
      value: "Font Size"
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
    }

  },
  {
    uuid: "2",
    name: "name",
    applicationId: "1",
    component_type: ComponentType.TextInput,
    parameters: {
      value: "22px"
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
    style: {
      width: "300px",
      "--hybrid-menu-border": "none"
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
                value: "Elements"
              },
              childrends: {
                type: "componentIdArray",
                value: ["2"]

              }
            }
          ]
      }
    }
  },
  {
    uuid: "text_label_handlers_collpase_ontainer",
    applicationId: "1",
    name: "position collapse container",
    component_type: ComponentType.VerticalContainer,
    ...COMMON_ATTRIBUTES,
    style: {
      marginTop: "13px",
    },
    childrenIds: ["text_label_handlers_collpase"]
  },
  {
    uuid: "text_label_handlers_collpase",
    applicationId: "1",
    name: " collapse",
    component_type: ComponentType.Collapse,
    style: {
      "--hy-collapse-content-small-size-padding": "5px",
      "--hy-collapse-font-weight": "normal",
      "--hy-collapse-border-radius": "0px",
      "--hy-collapse-width": "292px",
      "--hy-collapse-border": "none",
      '--hy-collapse-border-bottom': '1px solid #636363',
      '--hy-collapse-local-header-background-color': '#3d3d3d'
    },
    input: {
      size: {
        type: 'string',
        value: 'small'
      },
      components: {
        type: 'handler',
        value: /* js */ `
                return [{ blockName: 'text_label_handlers', label: 'Triggers' , open : true}];
                `
      }
    }
  },
  {
    uuid: "text_label_handlers",
    applicationId: "1",
    name: "Parent hander Container",
    component_type: ComponentType.Handlers,
    input:{
      allowedEvents:{
        type: "handler",
        value: /* js */`
                return [
                  {
                      name: "onClick",
                      label: "onClick"
                  },
                  {
                      name: "onMouseEnter",
                      label: "onMouseEnter"
                  },
                  { 
                      name: "onMouseLeave",
                      label: "onMouseLeave"
                  },
                  {
                      name: "onDoubleClick",
                      label: "onDoubleClick"
                  }
               ];
                `
      },
     events:{
       type : "handler",
       value: /* js */`
                const selectedComponents = GetVar("selectedComponents") || [];
                const selectedComponent = selectedComponents[0];
                let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                return currentComponent.event ?? {}
                `
     }
    }
  },
  {
    uuid: "text_label_handler",
    applicationId: "1",
    name: "Parent hander Container",
    component_type: ComponentType.VerticalContainer,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "flex-direction": "column"
    },
    childrenIds: [
      "text_label_handlers_collpase_ontainer",
    ]
  },
  {
    uuid: "text_label_bocks",
    applicationId: "1",
    name: "Parent Color Container",
    component_type: ComponentType.VerticalContainer,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "flex-direction": "column"
    },
    childrenIds: [
      "value_text_block",
      "display_block",
      "typography_collapse_container",
      "size_collapse_container",
      "border_collapse_container",
      // "font_color_block",

    ]
  },
  {
    uuid: "buttons_bocks",
    applicationId: "1",
    name: "Parent Color Container",
    component_type: ComponentType.VerticalContainer,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "flex-direction": "column"
    },
    childrenIds: ["label_text_block",
      "position_collapse_container",
      "size_block",
      "button_type_block",
      "divider",
      "icon_picker_block",
      "state_block",
      "divider",
      "button_click_event_block",
      "parent_color_container",
      "display_block",
      "button_icon_position_block"]
  },
  {
    uuid: "right_panel_tabs",
    applicationId: "1",
    name: "right_panel_tabs",
    component_type: ComponentType.Tabs,
    event: {},
    style: {
      width: "100%",
      height: "100%",
      display: "grid",
      "--hybrid-tabs-content-padding": "0px"
    },
    input: {
      tabs: {
        type: "handler",
        value: /* js */ `
                const selectedComponents = GetVar("selectedComponents") || [];
                const currentPageId = GetVar("currentPage");
                const currentEditingApplication = GetVar("currentEditingApplication");
                let parameters = [];
                let handlers = [];
                let themes = [];
                if(selectedComponents.length)
                    { 
                        const component = GetComponent(selectedComponents[0],currentEditingApplication.uuid);
                    switch(component.component_type){
                        case "text_label":
                            parameters=[
                               "text_label_bocks"
                            ];
                            handlers=[
                                "text_label_handler"
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
                                'buttons_bocks'
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
                                'select_width_vertical_container',
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
                            value: "Handlers"
                        },
                        childrends: {
                            type: "componentIdArray",
                            value:  selectedComponents.length|| currentPageId
                                ? handlers
                                : []
                        }
                    },
                    {
                        label: {
                            type: "text",
                            value: "Theme"
                        },
                        childrends: {
                            type: "componentIdArray",
                            value:  selectedComponents.length|| currentPageId
                                ? themes
                                : []
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
    input: {
      value: {
        type: "handler",
        value:/* js */`
                const selectComponentText=' ';
                return selectComponentText;
                
                `
      }
    }
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
  ...studioBorderCollapse,
  ...studioSelectLabelColor,
  ...studioInputLabelColor,
  ...studioInputLabelSize,
  ...studioSelectWidth,
  ...studioSelectLabelSize,
  ...studioSelectValuesBlock,
  ...studioStatusBlock,
  ...studioSizeBlock,
  ...studioInputTypeBlock,
  ...studioStateBlock,
  ...studioButtonTypeBlock,
  ...studioIconPickerBlock,
  ...studioTypographyCollapseBlock,
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
  ...studioSizeCollpaseBlock,
  ...QuickActions,
  ...microAppSelectionBlocks,
  ...microAppContainerBlocks,
  ...collectionContainerBlocks,
  ...collectionDataBlocks,
  ...TopBar,
  ...LeftPanel,
  ...studioButtonThemeBlock
];
