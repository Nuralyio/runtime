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
import studioHelperTextBlock from "./editor/common/inputs/helper-text.ts";
import studioStatusBlock from "./common-blocks/studio-status-block.ts";
import studioSizeBlock from "./common-blocks/studio-size-block.ts";
import studioPlaceholderBlock from "./editor/common/inputs/placeholder.ts";
import studioPositionBlock from "./common-blocks/studio-position-block.ts";
import studioWidthBlock from "./common-blocks/studio-width-block.ts";
import studioHeightBlock from "./common-blocks/studio-height-block.ts";
import studioFLexBlock from "./common-blocks/flex-size.ts";
import studioButtonTypeBlock from "./editor/right-panel-tabs/button/inputs/type.ts";
import studioButtonIconPosition from "./editor/right-panel-tabs/button/inputs/icon-position.ts";
import studioIconPickerBlock from "./editor/common/inputs/icon.ts";
import studioTypographyCollapseBlock from "./common-blocks/typography-collapse-block.ts";
import studioSizeCollpaseBlock from "./common-blocks/size-collpase-block.ts";
import studioCursorBlock from "./common-blocks/styles/cursor-block.ts";
import studioButtonClickEventBlock from "./button-blocks/studio-button-click-event-block.ts";
import studioInputLabelColor from "./editor/right-panel-tabs/text-input/inputs/studio-input-label-color.ts";
import studioInputLabelSize from "./editor/right-panel-tabs/text-input/inputs/studio-input-label-size.ts";
import studioInputHelperColor from "./editor/right-panel-tabs/text-input/inputs/studio-input-helper-color.ts";
import studioInputHelperSize from "./editor/right-panel-tabs/text-input/inputs/studio-input-helper-size.ts";
import studioCheckboxCheckedBlock from "./editor/right-panel-tabs/checkbox/inputs/checked.ts";
import studioImageAltBlock from "./editor/right-panel-tabs/image/inputs/alt.ts";
import studioImageSrcBlock from "./editor/right-panel-tabs/image/inputs/src.ts";
import studioImageFallbackBlock from "./editor/right-panel-tabs/image/inputs/src-fallback.ts";
import studioDatepickerLocaleBlock from "./editor/right-panel-tabs/datepicker/inputs/locale.ts";
import studioDatepickerFormatBlock from "./editor/right-panel-tabs/datepicker/inputs/format.ts";
import studioInputTypeBlock from "./editor/right-panel-tabs/text-input/inputs/studio-input-type-block.ts";
import studioSelectLabelSize from "./editor/right-panel-tabs/select/inputs/label-fontsize.ts";
import studioSelectTypeBlock from "./editor/right-panel-tabs/select/inputs/select-type.ts";
import studioSelectSelectionmodeBlock from "./editor/right-panel-tabs/select/inputs/selection_mode.ts";
import stduioTable from "./editor/right-panel-tabs/table/inputs/columns-block.ts";
import tableSelectionModeBlock from "./editor/right-panel-tabs/table/inputs/selection-mode.ts";
import tableFilterBlock from "./editor/right-panel-tabs/table/inputs/filter.ts";
import studioIconColorBlock from "./editor/right-panel-tabs/icon/inputs/color.ts";
import QuickActions from "../components/editor-micro-apps/quick-action.ts";
import QuickActionsButton from "../components/editor-micro-apps/quick-action-bottom.ts";
import studioCheckboxChangedEventBlock from "./checkbox-blocks/studio-checkbox-changed-event-block.ts";
import studioLabelBlock from "./editor/common/inputs/label.ts";
import studioBorderCollapse from "./common-blocks/studio-border-collapse.ts";
import studioSelectValuesBlock from "./editor/right-panel-tabs/select/inputs/studio-select-values-block.ts";
import studioTableValuesBlock from "./editor/right-panel-tabs/table/inputs/data.ts";
import studioPageNameBlock from "./page-blocks/studio-page-name-block.ts";
import studioPageUrlBlock from "./page-blocks/studio-page-url-block.ts";
import studioPageSEOBlock from "./page-blocks/studio-page-seo-block.ts";
import microAppSelectionBlocks from "./microapp-blocks/micro-app-selection-blocks.ts";
import microAppContainerBlocks from "./microapp-blocks/micro-app-container-blocks.ts";
import collectionContainerBlocks from "./collection-blocks/collection-blocks-container.ts";
import collectionDataBlocks from "./editor/right-panel-tabs/collection/inputs/data.ts";
import TopBar from "../components/editor-micro-apps/top-bar.ts";
import LeftPanel from "../components/editor-micro-apps/left-panel.ts";
import RightPanelTabs from "./editor/right-panel-tabs/right_panel_tabs.ts";
import RightPanelFunctionTab from "./editor/right-panel-tabs/right_panel_function_tabs.ts";


import { StudioButton } from "./editor/right-panel-tabs/button";
import { StudioTextLabel } from "./editor/right-panel-tabs/text-label";
import { StudioCheckbox } from "./editor/right-panel-tabs/checkbox";
import { StudioIcon } from "./editor/right-panel-tabs/icon";
import { StudioSelect } from "./editor/right-panel-tabs/select";
import { StudioDatepicker } from "./editor/right-panel-tabs/datepicker";
import { StudioImage } from "./editor/right-panel-tabs/image";
import { StudioTable } from "./editor/right-panel-tabs/table";
import { StudioContainer } from "./editor/right-panel-tabs/container";
import { StudioCommonInputs } from "./editor/common/inputs";
import { StudioCollection } from "./editor/right-panel-tabs/collection";
import { StudioFunction } from "./editor/left-panel-tabs/functions";
import { StudioTextInput } from "./editor/right-panel-tabs/text-input/index.ts";
import { StudioDashboard } from "./dashboard/index.ts";
import { StudioRefComponent } from "./editor/right-panel-tabs/ref-component/index.ts";
import { PageThemeStudio } from "./page-blocks/themes.ts";
import { StudioCode } from "./editor/right-panel-tabs/code/index.ts";
import { StudioMenu } from "./editor/right-panel-tabs/menu/index.ts";
import { StudioRichText } from "./editor/right-panel-tabs/Richtext/index.ts";
import { StudioDropdown } from "./editor/right-panel-tabs/dropdown/index.ts";
import { StudioRichTextEditor } from "./editor/right-panel-tabs/RichtextEditor/index.ts";
import { StudioEmbed } from "./editor/right-panel-tabs/embed/index.ts";
import { StudioLink } from "./editor/right-panel-tabs/link/index.ts";
import { StudioFileUpload } from "./editor/right-panel-tabs/file-upload/index.ts";


export default [

  {
    uuid: "divider",
    name: "divider",
    component_type: ComponentType.Divider,
    application_id: "1",
    input: {}
  },
  {
    uuid: "1",
    name: "text_label",
    component_type: ComponentType.TextLabel,
    parameters: {
      value: "Font Size"
    },

    
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    inputHandlers: {
      value: ` GetContextVar("text_label_value");`
    }

  },
  {
    uuid: "2",
    name: "name",
    application_id: "1",
    component_type: ComponentType.TextInput,
    parameters: {
      value: "22px"
    },
    event: {
      valueChange: `
            
            SetContextVar("text_label_value", EventData.value);
            updateStyle(app1.text_label, "color", EventData.value);
            
      `
    },
    ...COMMON_ATTRIBUTES
  },
  {
    uuid: "left_panel_tabs",
    application_id: "1",
    name: "left_panel_tabs",
    component_type: ComponentType.Tabs,

    event: {
      valueChange: `
        updateStyle(app1.text_label, "color", EventData.value);
      `

    },
    ...COMMON_ATTRIBUTES,
    style: {
      "--hybrid-menu-border": "none",
      "--hybrid-tabs-container-box-shadow":" 0px 0px 4px 0px #dbdbdbbf",
      "--hybrid-tabs-content-background-color": "transparent",
     "--hybrid-tabs-border-radius": "8px",
      "width": "295px",
      "--hybrid-tabs-container-background-local-color": "transparent",
      "--hybrid-tabs-label-active-background-color": "transparent",
      

    },
    input: {
      index:{
        type: "number",
        value: 0
      },
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
           /* {
              label: {
                type: "text",
                value: "Elements"
              },
              childrends: {
                type: "componentIdArray",
                value: ["2"]

              }
            },*/
            {
              label: {
                type: "text",
                value: "Functions"
              },
              childrends: {
                type: "componentIdArray",
                value: ["function_micro_app_block"]

              }
            },
            {
              label: {
                type: "text",
                value: "Files"
              },
              childrends: {
                type: "componentIdArray",
                value: ["files_micro_app_block"]

              }
            }
          ]
      }
    }
  },
  {
    uuid: "text_label_handlers_collapse_container",
    application_id: "1",
    name: "position collapse container",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      marginTop: "13px"
    },
    childrenIds: ["text_label_handlers_collpase"]
  },
  {
    uuid: "text_label_handlers_collpase",
    application_id: "1",
    name: " collapse",
    component_type: ComponentType.Collapse,
    style: {
      "--hy-collapse-content-small-size-padding": "5px",
      "--hy-collapse-font-weight": "normal",
      "--hy-collapse-border-radius": "0px",
      "--hy-collapse-width": "292px",
      "--hy-collapse-border": "none",
      "--hy-collapse-border-bottom": "1px solid #636363",
      "--hy-collapse-local-header-background-color": "#3d3d3d"
    },
    input: {
      size: {
        type: "string",
        value: "small"
      },
      components: {
        type: "handler",
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
    application_id: "1",
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
  ...PageThemeStudio,
  ...studioPageNameBlock,
  ...studioPageUrlBlock,
  ...studioPageSEOBlock,
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
  ...studioFLexBlock,
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
  //...studioSelectHelperColor,
  ...studioInputHelperSize,
  ...studioLabelBlock,
  ...studioBorderCollapse,
  ...studioInputLabelColor,
  ...studioInputLabelSize,
  ...studioSelectLabelSize,
  ...studioSelectValuesBlock,
  ...studioStatusBlock,
  ...studioSizeBlock,
  ...studioInputTypeBlock,
  ...studioButtonTypeBlock,
  ...studioIconPickerBlock,
  ...studioTypographyCollapseBlock,
  ...studioPositionBlock,
  ...studioButtonIconPosition,
  ...studioClickEvent,
  ...studioMouseEnterEvent,
  ...studioMouseLeaveEvent,
  ...studioIconColorBlock,
  ...studioButtonClickEventBlock,
  ...studioCheckboxCheckedBlock,
  ...studioImageAltBlock,
  ...studioImageSrcBlock,
  ...studioImageFallbackBlock,
  ...studioCheckboxChangedEventBlock,
  ...studioSelectTypeBlock,
  ...studioSelectSelectionmodeBlock,
  ...studioSizeCollpaseBlock,
  ...studioCursorBlock,
  ...QuickActions,
  ...QuickActionsButton,
  ...microAppSelectionBlocks,
  ...microAppContainerBlocks,
  ...collectionContainerBlocks,
  ...collectionDataBlocks,
  ...TopBar,
  ...LeftPanel,
  ...StudioButton,
  ...StudioCheckbox,
  ...StudioIcon,
  ...StudioSelect,
  ...StudioDatepicker,
  ...StudioImage,
  ...StudioTable,
  ...StudioContainer,
  ...StudioCommonInputs,
  ...StudioCollection,
  ...StudioFunction,
  ...StudioTextInput,
  ...RightPanelFunctionTab,
  ...StudioDashboard,
  ...StudioRefComponent,
  ...StudioCode,
  ...StudioMenu,
  ...StudioRichText,
  ...StudioRichTextEditor,
  ...StudioDropdown,
  ...StudioEmbed,
  ...StudioLink,
  ...StudioFileUpload
];
