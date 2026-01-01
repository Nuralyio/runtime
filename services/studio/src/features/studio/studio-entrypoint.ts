import QuickActions from "./params/editor-micro-apps/quick-action.ts";
import QuickActionsButton from "./params/editor-micro-apps/quick-action-bottom.ts";
import TopBar from "./params/editor-micro-apps/top-bar.ts";
import LeftPanel from "./params/editor-micro-apps/left-panel.ts";
import stduioTable from "./params/data/table/inputs/columns-block.ts";
import tableSelectionModeBlock from "./params/data/table/inputs/selection-mode.ts";
import tableFilterBlock from "./params/data/table/inputs/filter.ts";
import studioTableValuesBlock from "./params/data/table/inputs/data.ts";

// Import from new organized structure
import {
  StudioTextInput, StudioTextarea, StudioSlider, StudioTextLabel, StudioDatepicker, StudioSelect, StudioButton,
  StudioCheckbox, StudioCode, StudioCollection, StudioContainer, StudioCard, StudioDocument,
  StudioDropdown, StudioEmbed, StudioFileUpload, StudioIcon, StudioImage, StudioLink,
  StudioRefComponent, StudioRichText, StudioRichTextEditor, StudioTable, StudioVideo,
  StudioMenu, StudioBadge, StudioTag, StudioGridRow, StudioGridCol, StudioForm, StudioModal
} from "./params/index.ts";

import {
  RightPanelTabs,
  RightPanelFunctionTab,
  StudioFunction
} from "./panels/index.ts";

import {
  studioBoxShadowBlock,
  studioBorderRadiusBlock,
  studioBoxModelBlock,
  studioTypographyCollapseBlock,
  studioSizeCollpaseBlock,
  commonInputsCollapseBlock,
  studioBorderCollapse,
  studioPageInfoContainerBlock,
  studioPageNameBlock,
  studioPageUrlBlock,
  studioPageSEOBlock,
  studioPageDefaultCheckboxBlock,
  studioPageAccessControlBlock,
  studioAppAccessControlBlock,
  studioAppSettingsBlock,
  microAppSelectionBlocks,
  microAppContainerBlocks,
  StudioDashboard,
  PageThemeStudio,
  studioTablePropertiesBlock,
  studioValidationRulesBlock,
  studioBorderManagerBlock
} from "./blocks/index.ts";

import {
  COMMON_ATTRIBUTES,
  StudioCommonInputs,
  studioDisplayBlock,
  studioHelperTextBlock,
  studioPlaceholderBlock,
  studioIconPickerBlock,
} from "./core/index.ts";


export default [

  {
    uuid: "divider",
    name: "divider",
    component_type: "Divider",
    application_id: "1",
    input: {}
  },
  {
    uuid: "select_component_styles_state_container",
    name: "Select Component Styles Container",
    application_id: "1",
    component_type: "vertical-container-block",
    ...COMMON_ATTRIBUTES,
    style: {
          display: "flex",
          justifyContent: "flex-end",
          width :"292px",
          "margin-bottom": "4px",
    },
    childrenIds: [ "select_component_styles_state"]
  },
 
  {
    uuid: "select_component_styles_state",
    name: "Select Component Styles",
    application_id: "1",
    component_type: "select",
    input: {
        size: {
            type: "string",
            value: "small"
        },
        placeholder: {
            type: "string",
            value: 'Select a component state'
        },
        options: {
            type: "handler",
            value: /* js */ `
                const options = [
                    { label: "State", value: "default" },
                    { label: "Hover", value: ":hover" },
                    { label: "Active", value: ":active" },
                    { label: "Focus", value: ":focus" },
                    { label: "Disabled", value: ":disabled" }
                ];
                return options;
            `
        },
        value: {
            type: "string",
            value: "default"
        },
        searchable: {
            type: "boolean",
            value: true
        },
        searchPlaceholder: {
            type: "string",
            value: "Search states..."
        }
    },
    event: {
        onChange: /* js */ `
            $selected_component_style_state = EventData.value;
        `
    },
    style: {
        "--nuraly-select-width": "100px",
        "--nuraly-select-background-color": "#2a2a2a",
        "--nuraly-select-text-color": "#ffffff",
        "--nuraly-select-border": "1px solid #444",
        "--nuraly-select-hover-background": "#3a3a3a",
        "--nuraly-select-dropdown-z-index": "9999",
        "--nuraly-select-z-index": "9999",
        "position": "relative",
        
        "z-index": "9999"
    }
  },
  {
    uuid: "vdivider",
    name: "vdivider",
    component_type: "Divider",
    application_id: "1",
    input: {
      direction: {
        type: "string",
        value: "vertical"
      }
    }
  },
  {
    uuid: "1",
    name: "text_label",
    component_type: "text_label",
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
    component_type: "text_input",
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
    component_type: "tabs",
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
      `,
      onTabPopOut: /* js */ `
        // Tab is now in its own window - you can store state or handle custom logic here
      `,
      onTabPopIn: /* js */ `
        // Tab is restored to the main tabs - you can restore state or handle custom logic here
      `
    },
    ...COMMON_ATTRIBUTES,
    style:{
"--nuraly-border-width-tabs-content-top": "0px",
  "--nuraly-border-width-tabs-top": "0px",
  "--nuraly-border-width-tabs-right": "0px",
  "--nuraly-border-width-tabs-bottom": "1px",
  "--nuraly-border-width-tabs-left": "0px",
      "--nuraly-spacing-tabs-content-padding-small": "0px",
  
  "--nuraly-border-width-tabs-top-hover": "0px",
  "--nuraly-border-width-tabs-right-hover": "0px",
  "--nuraly-border-width-tabs-bottom-hover": "1px",
  "--nuraly-border-width-tabs-left-hover": "0px",
  
  "--nuraly-border-width-tabs-top-active": "0px",
  "--nuraly-border-width-tabs-right-active": "1px",
  "--nuraly-border-width-tabs-bottom-active": "0px",
  "--nuraly-border-width-tabs-left-active": "1px",
  
  "--nuraly-border-width-tabs-top-focus": "2px",
  "--nuraly-border-width-tabs-right-focus": "2px",
  "--nuraly-border-width-tabs-bottom-focus": "2px",
  "--nuraly-border-width-tabs-left-focus": "2px",
        "--nuraly-tabs-labels-gap": "0px",




    "--nuraly-panel-small-height": "400px",
    "--nuraly-border-radius-small": "0px",
    "--nuraly-label-font-weight": "350",
    "--nuraly-panel-header-background": "#fcfcfc",
    height: "100%",
    "overflow-y": "auto",
    "--nuraly-panel-body-padding-small": "0px"
        
    },
    input: {
      // popOut: {
      //   type: "object",
      //   value: {
      //     enabled: true,
      //     canPopOut: true,
      //     canPopIn: true,
      //     windowPanel: {
      //       title: '{tabLabel} - Popped Out',
      //       width: '800px',
      //       height: '600px',
      //       resizable: true,
      //       draggable: true,
      //       closable: false,
      //       minimizable: true
      //     }
      //   }
      // },
      panelConfig: {
        type: "object",
        value: {
          enabled: false,
          mode: 'embedded',
          resizable: false,
          title: 'Panel Tabs',
        }
      },
      align : {
        type: "string",
        value: "stretch"
      },
      size: {
        type: "string",
        value: "small"
      },
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
              icon :{
                type:"string",
                value:"panel-top"
              },
              key : "pages",
              childrends: {
                type: "componentIdArray",
                value: ["pages_panel"]

              }
            },
            {
              label: {
                type: "text",
                value: "Functions",
              },
              icon :{
                type:"string",
                value:"parentheses"
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
              icon : {
                type:"string",
                value:"folders"
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
    component_type: "vertical-container-block",
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
    component_type: "Collapse",
    style: {
      "--nr-collapse-content-small-size-padding": "5px",
      "--nr-collapse-font-weight": "normal",
      "--nr-collapse-border-radius": "0px",
      "--nr-collapse-width": "292px",
      "--nr-collapse-border": "none",
      "--nr-collapse-border-bottom": "1px solid #636363",
      "--nr-collapse-local-header-background-color": "#3d3d3d"
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

  ...RightPanelTabs,
  {
    uuid: "select_component_text",
    name: "text_label",
    component_type: "text_label",
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
  ...studioPageInfoContainerBlock,
  ...studioPageNameBlock,
  ...studioPageUrlBlock,
  ...studioPageSEOBlock,
  ...studioPageDefaultCheckboxBlock,
  ...studioPageAccessControlBlock,
  ...studioAppAccessControlBlock,
  ...studioAppSettingsBlock,
  ...studioTablePropertiesBlock,
  ...studioTableValuesBlock,
  ...stduioTable,
  ...tableSelectionModeBlock,
  ...tableFilterBlock,
  // Removed: ...studioWidthBlock, ...studioHeightBlock (now in studioSizeCollpaseBlock)
  ...studioBoxShadowBlock,
  ...studioBorderRadiusBlock,
  ...studioBoxModelBlock,
  ...studioDisplayBlock,
  ...studioPlaceholderBlock,
  ...studioHelperTextBlock,
  //...studioSelectHelperColor,
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
  ...StudioCard,
  ...StudioCommonInputs,
  ...StudioCollection,
  ...StudioFunction,
  ...StudioTextInput,
  ...StudioTextarea,
  ...StudioSlider,
  ...StudioBadge,
  ...StudioTag,
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
    ...StudioVideo,
    ...StudioGridRow,
    ...StudioGridCol,
    ...StudioForm,
    ...StudioModal,
    ...studioValidationRulesBlock,
    ...studioBorderManagerBlock
];
