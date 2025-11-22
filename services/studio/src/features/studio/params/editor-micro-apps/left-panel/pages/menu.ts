import { ComponentType } from "@shared/redux/store/component/component.interface";

export const pagesMenu = {
  uuid: "menu_1",
  name: "menu",
  application_id: "1",
  component_type: ComponentType.Menu,
  style: {
    "--nuraly-menu-border": "none",
    "--nuraly-menu-font-size": "13px",
    "--nuraly-sub-menu-highlighted-background-color": "transparent",
    "--nuraly-menu-selected-link-border": "5px solid transparent",
    "--nuraly-menu-selected-link-background-color": "tansparent",
    "--nuraly-menu-selected-color": "#5393f8",
    "--nuraly-menu-link-icon-color": "#222222e3",
    "--nuraly-color-icon": "#222222e3",
    "--nuraly-menu-focus-border": "2px solid transparent",
    "--nuraly-menu-focus-color": "#5393f8",
    "margin-left": "13px",
    "margin-top": "11px",
    "--nuraly-menu-link-padding-medium": "4px",
    "height": "39vh",
    "overflow-y": "auto"
  },
  input: {
    arrowPosition: {
      type: "string",
      value: "left"
    },
    options: {
      type: "handler",
      value: /* js */`
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
                icon: 'ellipsis-vertical',
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
            findSelectedPath(appId, componentIds);
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
              icon: 'ellipsis-vertical',
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
    onSelect: /* js */`
      if(EventData.type === "page"){
        Vars.currentPage = EventData.id;
        Vars.selectedComponents = [];
      } else {
        const componentParentPage = EventData.page;
        const currentPage = Vars.currentPage;
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
    actionClick: /* js */`
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
      } else if(EventData.action === "copy"){
        eventHandler.emit("Copy")
      }
    `
  }
};
