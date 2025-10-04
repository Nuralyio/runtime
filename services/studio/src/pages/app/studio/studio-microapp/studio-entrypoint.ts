import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "./helper/common_attributes.ts";
import studioBackgroundcolorBlock from "./text-labels-blocks/studio-backgroundcolor-block.ts";
import studioBoxShadowBlock from "./text-labels-blocks/studio-box-shadow-block.ts";
import studioBorderRadiusBlock from "./text-labels-blocks/studio-border-radius-block.ts";
import studioClickEvent from "./text-labels-blocks/studio-click-event.ts";
import studioMouseEnterEvent from "./text-labels-blocks/studio-mouse-enter-event.ts";
import studioMouseLeaveEvent from "./text-labels-blocks/studio-mouse-leave-event.ts";
import studioDisplayBlock from "./editor/common/inputs/display.ts";
import studioHelperTextBlock from "./editor/common/inputs/helper-text.ts";
import studioStatusBlock from "./common-blocks/studio-status-block.ts";
import studioSizeBlock from "./common-blocks/studio-size-block.ts";
import studioPlaceholderBlock from "./editor/common/inputs/placeholder.ts";
import studioFLexBlock from "./common-blocks/flex-size.ts";
import studioIconPickerBlock from "./editor/common/inputs/icon.ts";
import studioTypographyCollapseBlock from "./common-blocks/typography-collapse-block.ts";
import studioSizeCollpaseBlock from "./common-blocks/size-collpase-block.ts";
import studioCursorBlock from "./common-blocks/styles/cursor-block.ts";
import commonInputsCollapseBlock from "./common-blocks/common-inputs-collapse-block.ts";
import stduioTable from "./editor/right-panel-tabs/table/inputs/columns-block.ts";
import tableSelectionModeBlock from "./editor/right-panel-tabs/table/inputs/selection-mode.ts";
import tableFilterBlock from "./editor/right-panel-tabs/table/inputs/filter.ts";
import QuickActions from "../components/editor-micro-apps/quick-action.ts";
import QuickActionsButton from "../components/editor-micro-apps/quick-action-bottom.ts";
import studioLabelBlock from "./editor/common/inputs/label.ts";
import studioBorderCollapse from "./common-blocks/studio-border-collapse.ts";
import studioTableValuesBlock from "./editor/right-panel-tabs/table/inputs/data.ts";
import studioPageNameBlock from "./page-blocks/studio-page-name-block.ts";
import studioPageUrlBlock from "./page-blocks/studio-page-url-block.ts";
import studioPageSEOBlock from "./page-blocks/studio-page-seo-block.ts";
import microAppSelectionBlocks from "./microapp-blocks/micro-app-selection-blocks.ts";
import microAppContainerBlocks from "./microapp-blocks/micro-app-container-blocks.ts";
import TopBar from "../components/editor-micro-apps/top-bar.ts";
import LeftPanel from "../components/editor-micro-apps/left-panel.ts";
import RightPanelTabs from "./editor/right-panel-tabs/right_panel_tabs.ts";
import RightPanelFunctionTab from "./editor/right-panel-tabs/right_panel_function_tabs.ts";


import { StudioTextInput, StudioTextLabel, StudioDatepicker, StudioSelect, StudioButton, StudioCheckbox, StudioCode, StudioCollection, StudioContainer, StudioDocument, StudioDropdown, StudioEmbed, StudioFileUpload, StudioIcon, StudioImage, StudioLink, StudioRefComponent, StudioRichText, StudioRichTextEditor } from "./editor/right-panel-tabs/index.ts";
import { StudioTable } from "./editor/right-panel-tabs/table";
import { StudioCommonInputs } from "./editor/common/inputs";
import { StudioFunction } from "./editor/left-panel-tabs/functions";
import { StudioDashboard } from "./dashboard/index.ts";
import { PageThemeStudio } from "./page-blocks/themes.ts";
import { StudioMenu } from "./editor/right-panel-tabs/menu/index.ts";
import { StudioVideo } from "./editor/right-panel-tabs/video";


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
      onTabChanged: /* js */ `
        if (EventData.tab.key === "files") {
          let filesTabs = Editor.Tabs.find(tab => tab.type === "files");
          
          if (!filesTabs) {
            filesTabs = { id: "files", label: "Files", type: "files" };
            openEditorTab(filesTabs);
          }
          
          setCurrentEditorTab(filesTabs);
        }
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
                value: "Pages",
              },
              key : "pages",
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
                value: "Functions",
              },
              key : "functions",
              childrends: {
                type: "componentIdArray",
                value: ["function_micro_app_block"]

              }
            },
            {
              label: {
                type: "text",
                value: "Files",
              },
              key : "files",
              childrends: {
                type: "componentIdArray",
                value: ["files_micro_app_block"]

              }
            }
          ]
      }
    },
   
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
  ...commonInputsCollapseBlock,
  ...studioTypographyCollapseBlock,
  ...studioSizeCollpaseBlock,

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
  ...studioBackgroundcolorBlock,
  // Removed: ...studioWidthBlock, ...studioHeightBlock (now in studioSizeCollpaseBlock)
  ...studioFLexBlock,
  ...studioBoxShadowBlock,
  ...studioBorderRadiusBlock,
  ...studioDisplayBlock,
  ...studioPlaceholderBlock,
  ...studioHelperTextBlock,
  //...studioSelectHelperColor,
  ...studioLabelBlock,
  ...studioBorderCollapse,
  ...studioStatusBlock,
  ...studioSizeBlock,
  ...studioIconPickerBlock,
  ...studioTypographyCollapseBlock,
  ...studioClickEvent,
  ...studioMouseEnterEvent,
  ...studioMouseLeaveEvent,
  ...studioSizeCollpaseBlock,
  ...studioCursorBlock,
  ...QuickActions,
  ...QuickActionsButton,
  ...microAppSelectionBlocks,
  ...microAppContainerBlocks,
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
  ...commonInputsCollapseBlock,
  ...studioTypographyCollapseBlock,
  ...studioSizeCollpaseBlock,
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
  ...StudioFileUpload,
    ...StudioDocument,
    ...StudioVideo
];
