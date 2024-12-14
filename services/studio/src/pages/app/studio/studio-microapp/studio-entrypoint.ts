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
import studioDisplayBlock from "./editor/common/inputs/display.ts";
import studioHelperTextBlock from "./common-blocks/studio-helper-block.ts";
import studioStateBlock from "./common-blocks/studio-state-block.ts";
import studioStatusBlock from "./common-blocks/studio-status-block.ts";
import studioSizeBlock from "./common-blocks/studio-size-block.ts";
import studioPlaceholderBlock from "./common-blocks/studio-placeholder-block.ts";
import studioPositionBlock from "./common-blocks/studio-position-block.ts";
import studioWidthBlock from "./common-blocks/studio-width-block.ts";
import studioHeightBlock from "./common-blocks/studio-height-block.ts";
import studioButtonTypeBlock from "./button-blocks/studio-button-type-block.ts";
import studioButtonIconPosition from "./editor/right-panel-tabs/button/inputs/icon-position.ts";
import studioIconPickerBlock from "./common-blocks/studio-icon-picker-block.ts";
import studioTypographyCollapseBlock from "./common-blocks/typography-collapse-block.ts";
import studioSizeCollpaseBlock from "./common-blocks/size-collpase-block.ts";
import studioButtonClickEventBlock from "./button-blocks/studio-button-click-event-block.ts";
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
import studioLabelBlock from "./editor/common/inputs/label.ts";
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
import RightPanelTabs from "./editor/right-panel-tabs/right_panel_tabs.ts";


import { StudioButton } from "./editor/right-panel-tabs/button";
import { StudioTextLabel } from "./editor/right-panel-tabs/text-label";




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
    uuid: "text_label_handlers_collapse_container",
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

  ...StudioTextLabel,

  RightPanelTabs,
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
  ...StudioButton,
];
