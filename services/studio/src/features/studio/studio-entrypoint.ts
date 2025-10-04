import { ComponentType } from "@shared/redux/store/component/interface.ts";
import QuickActions from "./components-configuration/editor-micro-apps/quick-action.ts";
import QuickActionsButton from "./components-configuration/editor-micro-apps/quick-action-bottom.ts";
import TopBar from "./components-configuration/editor-micro-apps/top-bar.ts";
import LeftPanel from "./components-configuration/editor-micro-apps/left-panel.ts";
import stduioTable from "./components-configuration/data/table/inputs/columns-block.ts";
import tableSelectionModeBlock from "./components-configuration/data/table/inputs/selection-mode.ts";
import tableFilterBlock from "./components-configuration/data/table/inputs/filter.ts";
import studioTableValuesBlock from "./components-configuration/data/table/inputs/data.ts";

// Import from new organized structure
import {
    StudioTextInput, StudioTextLabel, StudioDatepicker, StudioSelect, StudioButton,
    StudioCheckbox, StudioCode, StudioCollection, StudioContainer, StudioDocument,
    StudioDropdown, StudioEmbed, StudioFileUpload, StudioIcon, StudioImage, StudioLink,
    StudioRefComponent, StudioRichText, StudioRichTextEditor, StudioTable, StudioVideo,
    StudioMenu
} from "./components-configuration/index.ts";

import {
    RightPanelTabs,
    RightPanelFunctionTab,
    StudioFunction
} from "./panels/index.ts";

import {
    studioBoxShadowBlock,
    studioBorderRadiusBlock,
    studioTypographyCollapseBlock,
    studioSizeCollpaseBlock,
    commonInputsCollapseBlock,
    studioBorderCollapse,
    studioPageNameBlock,
    studioPageUrlBlock,
    studioPageSEOBlock,
    microAppSelectionBlocks,
    microAppContainerBlocks,
    StudioDashboard,
    PageThemeStudio
} from "./blocks/index.ts";

import {
    COMMON_ATTRIBUTES,
    StudioCommonInputs,
    studioDisplayBlock,
    studioHelperTextBlock,
    studioPlaceholderBlock,
    studioIconPickerBlock,
    studioLabelBlock
} from "./core/index.ts";


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
  // Removed: ...studioWidthBlock, ...studioHeightBlock (now in studioSizeCollpaseBlock)
  ...studioBoxShadowBlock,
  ...studioBorderRadiusBlock,
  ...studioDisplayBlock,
  ...studioPlaceholderBlock,
  ...studioHelperTextBlock,
  //...studioSelectHelperColor,
  ...studioLabelBlock,
  ...studioBorderCollapse,
  ...studioIconPickerBlock,
  ...studioTypographyCollapseBlock,
  ...studioSizeCollpaseBlock,
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
