import { ComponentType } from "$store/component/interface.ts";

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
    margin: "10px 10px 0 10px",


  },
  childrenIds: ["left_panel_tabs"]
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
       "--hybrid-button-font-size": "12px"
    },
    childrenIds: ["menu_header", "menu_1"]
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
      "--hybrid-button-padding-y": "2px",
      "--hybrid-button-padding-x": "2px",
      "type": "ghost",
      "--hybrid-button-ghost-border-color": "transparent",
      "--hybrid-button-ghost-background-color": "transparent"
    },
    input: {
      label: {
        type: "handler",
        value: /* js */`
            const addPageLabelBtn='Page';
            return addPageLabelBtn;
        `
      },
      iconPosition:{
        type: "string",
        value: "left"
      },
      icon: {
        type: "handler",
        value: /* js */`
            const addBtnIcon='plus';
            return addBtnIcon;
        `
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
    application_id: "1"
  },
  {
    uuid: "menu_1",
    name: "menu",    
    application_id: "1",
    component_type: ComponentType.Menu,
    style: {
      "--hybrid-menu-border": "none",
      width: "100%",
      "--hybrid-menu-font-size": "12px",
      "--hybrid-sub-menu-padding-y": "4px",
      "--hybrid-menu-link-padding-y": "4px",
      "--hybrid-sub-menu-highlighted-background-color" : "transparent",
    },
    input: {
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
              case 'text_label': componentIcon = "i-cursor"; break;
              case 'select': componentIcon = 'th-list'; break;
              case 'checkbox': componentIcon = 'square-check'; break;
              case 'Table': componentIcon = 'table'; break;
              case 'vertical-container-block':
                componentIcon = component.input?.direction?.value === 'horizontal' ? 'grip-horizontal' : 'grip-vertical'; break;
              case 'text_input': componentIcon = 'pen-to-square'; break;
              case 'Image': componentIcon = 'image'; break;
              case 'icon': componentIcon = 'icons'; break;
              case 'DatePicker': componentIcon = 'calendar'; break;
              case 'Collection': componentIcon = 'layer-group'; break;
              case 'RefComponent': componentIcon = 'crosshairs'; break;
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
                    Vars.currentPage = componentParentPage;
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
        }
         `

    },
    
  }];