import { ComponentType } from "@shared/redux/store/component/component.interface";
import { isServer } from "@shared/utils/envirement";
import leftPanelTabs from "./left-panel-tabs";

export let filesAppUUID = "" ;
export let filesPageUUID = "" ;
if(!isServer){
 filesAppUUID = window.__MODULES_CONFIG__.files.app_uuid;
 filesPageUUID = window.__MODULES_CONFIG__.files.left_file_component_uuid;
}
export default [{
  uuid: "331",
  application_id: "1",
  name: "Left panel",
  component_type: ComponentType.Container,
  input: {
    direction: {
      type: "string",
      value: "vertical"
    }
  },
  style: {
    width: "100%",
    height: "100%",
    display: "grid",
  },
  childrenIds: ["left_panel_tabs"]
},
leftPanelTabs,

 {
    application_id: "1",
    uuid: "files_micro_app_block",
    name: "function_micro_app",
    component_type: ComponentType.MicroApp,
    input: {
      appUUID: {
        type: "string",
        value: filesAppUUID
      },
      componentToRenderUUID: {
        type: "string",
        value: filesPageUUID
      },
      mode: {
        type: "string",
        value: "preview"
      }
    },
  },
// pages component 
  {
    uuid: "pages_panel",
    application_id: "1",
    name: "Pages panel",
    component_type: ComponentType.Container,
    input: {
      direction: {
        type: "string",
        value: "vertical"
      }
    },

    style: {
      width: "255px",
      height: "100%",
       "--nuraly-button-font-size": "12px"
    },
    childrenIds: ["menu_heade2r", "menu_1"]
  },
  {
    uuid: "menu_header",
    name: "menu header",
    application_id: "1",

    component_type: ComponentType.Container,
    style: {
      "gap": "5px",
      "align-items": "center",
      "justify-content": "space-between",
      "width": "100%"
    },
    childrenIds: ["menu_title", "menu_tools"]
  },
  {
    uuid: "menu_title",
    name: "menu title",
    application_id: "1",

    component_type: ComponentType.TextLabel,
    input: {
      value: {
        type: "string",
        value: 'Pages'
      }
    }
  },
  {
    uuid: "menu_tools",
    name: "menu tools",
    application_id: "1",

    component_type: ComponentType.Container,
    style: {
      "gap": "5px",
      "align-items": "center",
      "justify-content": "space-between"
    },
    childrenIds: [ "add_page"]
  },
  {
    uuid: "add_page",
    name: "add page",
    component_type: ComponentType.Button,
    style: {
    },
    input: {
      label: {
        type: "string",
        value: "Page"
      },
      iconPosition:{
        type: "string",
        value: "left"
      },
      size:{
        type: "string",
        value: "small"
      },
      icon: {
        type: "string",
        value: "plus"
      }

    },

    event: {
      /* js */
      onClick: `
        try {
            const currentEditingApplication = GetVar("currentEditingApplication");
            const appPages = GetContextVar(currentEditingApplication?.uuid + ".appPages", currentEditingApplication?.uuid);
            const newPage = {
                name: "Page_" + (appPages.length + 1),
                url: ("Page_" + (appPages.length + 1)).toLowerCase(),
                description  : "",
                component_ids : []
            };
            AddPage(newPage, currentEditingApplication.uuid).then(() => {
            }).catch((e) => {
                console.error(e);
            })
         } catch(e) {
             console.log(e);
         }
         `
      /* end */
    },
    application_id: "1"
  },
  {
    uuid: "menu_1",
    name: "menu",    
    application_id: "1",
    component_type: ComponentType.Menu,
    style: {
      "--nuraly-menu-border": "none",
      "--nuraly-menu-font-size": "13px",
      "--nuraly-sub-menu-highlighted-background-color" : "transparent",
      "--nuraly-menu-selected-link-border" : "5px solid transparent",
      "--nuraly-menu-selected-link-background-color" : "tansparent",
      "--nuraly-menu-selected-color" : "#5393f8",
      "--nuraly-menu-link-icon-color" : "#222222e3",
      "--nuraly-color-icon" : "#222222e3",
      "--nuraly-menu-focus-border": "2px solid transparent",
      "--nuraly-menu-focus-color": "#5393f8",
      "margin-left": "13px",
      "margin-top": "11px",
      "--nuraly-menu-link-padding-medium" : "4px"
    },
    input: {
      arrowPosition : {
        type: "string",
        value: "left"
      },
     
      options: {
        type: "handler",
        value: /* js */ `
        const currentEditingApplication = GetVar("currentEditingApplication");
        const appPages = Vars[currentEditingApplication?.uuid + ".appPages"];
        const currentPage = Vars.currentPage || appPages?.[0]?.uuid;
        const currentComponent = Vars.selectedComponents;
        
        if (!appPages) {
          return [];
        }
        
        const selectedComponentId = currentComponent?.[0]?.uuid;
        const autoOpened = new Set();
        
        function findSelectedPath(appId, childrenIds) {
          for (const componentId of childrenIds) {
            const component = GetComponent(componentId, appId);
            if (!component) continue;
        
            if (component.uuid === selectedComponentId) {
              autoOpened.add(component.uuid);
              return true;
            }
        
            const componentChildrenIds = component?.childrenIds;
            if (componentChildrenIds?.length && findSelectedPath(appId, componentChildrenIds)) {
              autoOpened.add(component.uuid);
              return true;
            }
          }
          return false;
        }
        
        function findChildren(appId, children, childrenIds) {
          childrenIds.forEach((componentId) => {
            const component = GetComponent(componentId, appId);
            if (!component) return;
        
            const componentChildrenIds = component?.childrenIds;
            let componentIcon = 'smile';
        
            switch (component.component_type) {
              case 'text_label': componentIcon = "case-sensitive"; break;
              case 'rich-text': componentIcon = "whole-word"; break;
              case 'link': componentIcon = "link"; break;
              case 'menu': componentIcon = "menu"; break;
              case 'Tag': componentIcon = "tag"; break;
              case 'Textarea': componentIcon = "text-cursor-input"; break;
              case 'Badge': componentIcon = "badge"; break;
              case 'checkbox': componentIcon = 'square-check'; break;
              case 'Table': componentIcon = 'table'; break;
              case 'select': componentIcon = 'list-video'; break;
              case 'vertical-container-block':
                componentIcon = component.input?.direction?.value === 'horizontal' ? 'grip-horizontal' : 'grip-vertical'; break;
              case 'text_input': componentIcon = 'text-cursor-input'; break;
              case 'Image': componentIcon = 'image'; break;
              case 'icon': componentIcon = 'badge'; break;
              case 'DatePicker': componentIcon = 'calendar'; break;
              case 'Collection': componentIcon = 'layer-group'; break;
              case 'RefComponent': componentIcon = 'crosshairs'; break;
              case 'file-upload': componentIcon = 'file-up'; break;
              case 'button_input': componentIcon = 'rectangle-horizontal'; break;
              case 'Datepicker': componentIcon = 'calendar'; break;
              case 'Icon': componentIcon = 'cable-car'; break;
            }
        
            const isSelected = component.uuid === selectedComponentId;
        
            let childNode = {
              text: component.name,
              icon: componentIcon,
              id: component.uuid,
              selected: isSelected,
              handlerKey: "onSelect",
              menu: {
                icon: 'ellipsis-v',
                actions: [{
                  label: 'Delete',
                  value: 'delete',
                  icon: "trash",
                  additionalData: {
                    type: "component",
                    component
                  }
                },
                {
                  label: 'Copy',
                  value: 'copy',
                  icon: "copy",
                  additionalData: {
                    type: "component",
                    component
                  }
                }]

              }
            };
        
            if (componentChildrenIds?.length) {
              childNode.children = [];
              findChildren(appId, childNode.children, componentChildrenIds);
            }
        
            if (autoOpened.has(component.uuid)) {
              childNode.opened = true;
            }
        
            children.push(childNode);
          });
        }
        
        return appPages.map((page) => {
          const componentIds = page.component_ids;
          const appId = page.application_id;
          const children = [];
        
          if (componentIds) {
            findSelectedPath(appId, componentIds); // Fill autoOpened
            findChildren(appId, children, componentIds);
          }
        
          return {
            text: page.name,
            id: page.uuid,
            selected: page.uuid === currentPage,
            opened: page.uuid === currentPage,
            icon: 'file',
            type: "page",
            handlerKey: "onSelect",
            children: children,
            menu: {
              opened: true,
              icon: 'ellipsis-v',
              actions: [{
                handlerKey: "onDelete",
                label: 'Delete',
                value: 'delete',
                icon: "trash",
                additionalData: {
                  type: "page",
                  page
                }
              }]
            }
          };
        });

            `
      }
    },
    event: {
      onSelect: /* js */ `
        if(EventData.type === "page"){
                Vars.currentPage = EventData.id;
                Vars.selectedComponents = [];
            }else{
                const componentParentPage = EventData.page;
                const currentPage =  Vars.currentPage;
                if(componentParentPage != currentPage ){
                 // TODO: This triggers an error when the new component is selected; it navigates to the last page.
                    //Vars.currentPage = componentParentPage;
                }
                const selectedComponent = Editor.components.find(
                  component => component.uuid == EventData.id
                );
                Vars.selectedComponents = [selectedComponent];
            }
        `,
      /* js */

      actionClick: `
        if (EventData.action === "delete") {
          const { type, component, page } = EventData.value;
        
          switch (type) {
            case "component":
              if (component) {
                DeleteComponentAction(component);
              }
              break;
        
            case "page":
              if (page) {
                deletePage(page);
              }
              break;
          }
        }else if(EventData.action === "copy"){
          eventHandler.emit("Copy")
        }
         `

    },
    
  }];