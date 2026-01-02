export const pagesMenu = {
  uuid: "menu_1",
  name: "menu",
  application_id: "1",
  component_type: "menu",
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
    "height": "calc(100vh - 49px)",
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
        let currentPage = $currentPage || appPages?.[0]?.uuid;
        const currentComponent = $selectedComponents;
        if (!appPages) {
          return [];
        }

        const selectedComponentId = currentComponent?.[0]?.uuid;
        const autoOpened = new Set();
        let selectedComponentPageId = null;

        function findSelectedPath(appId, childrenIds, pageId) {
          for (const componentId of childrenIds) {
            const component = GetComponent(componentId, appId);
            if (!component) continue;

            if (component.uuid === selectedComponentId) {
              autoOpened.add(component.uuid);
              selectedComponentPageId = pageId;
              return true;
            }

            const componentChildrenIds = component?.childrenIds;
            if (componentChildrenIds?.length && findSelectedPath(appId, componentChildrenIds, pageId)) {
              autoOpened.add(component.uuid);
              return true;
            }
          }
          return false;
        }

        function findChildren(appId, children, childrenIds, pageId) {
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
              case 'modal-block': componentIcon = 'square-stack'; break;
            }

            const isSelected = component.uuid === selectedComponentId;

            let childNode = {
              text: component.name,
              icon: componentIcon,
              id: component.uuid,
              page: pageId,
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
                },
                {
                  label: 'Copy Component Name',
                  value: 'copyComponentName',
                  icon: "clipboard-copy",
                  additionalData: {
                    type: "component",
                    component
                  }
                }]
              }
            };

            if (componentChildrenIds?.length) {
              childNode.children = [];
              findChildren(appId, childNode.children, componentChildrenIds, pageId);
            }

            if (autoOpened.has(component.uuid)) {
              childNode.opened = true;
            }

            children.push(childNode);
          });
        }

        // First pass: find which page contains the selected component
        for (const page of appPages) {
          const componentIds = page.component_ids;
          const appId = page.application_id;
          if (componentIds && findSelectedPath(appId, componentIds, page.uuid)) {
            break;
          }
        }

        // If the selected component is on a different page, switch to that page
        if (selectedComponentPageId && selectedComponentPageId !== currentPage) {
          $currentPage = selectedComponentPageId;
          currentPage = selectedComponentPageId;
        }

        return appPages.map((page) => {
          const componentIds = page.component_ids;
          const appId = page.application_id;
          const children = [];
          const isPageWithSelectedComponent = page.uuid === selectedComponentPageId;

          if (componentIds) {
            findChildren(appId, children, componentIds, page.uuid);
          }

          return {
            text: page.name,
            id: page.uuid,
            selected: page.uuid === currentPage,
            opened: page.uuid === currentPage || isPageWithSelectedComponent,
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
        $currentPage = EventData.id;
        $selectedComponents = [];
      } else {
        const componentParentPage = EventData.page;
        const currentPage = $currentPage;
        if(componentParentPage && componentParentPage !== currentPage){
          $currentPage = componentParentPage;
        }
        const selectedComponent = Editor.components.find(
          component => component.uuid == EventData.id
        );
        $selectedComponents = [selectedComponent];
      }
    `,
    onActionClick: /* js */`
      // Get cursor position from the original mouse event
      const originalEvent = EventData.originalEvent;
      const mouseX = originalEvent?.clientX || 400;
      const mouseY = originalEvent?.clientY || 300;
      const position = { x: mouseX, y: mouseY };
      const closeMenu = EventData.close;

      if (EventData.action === "delete") {
        const type = EventData.value?.type;
        const component = EventData.value?.component;
        const page = EventData.value?.page;

        if (type === "component" && component) {
          
          ShowDeleteConfirm(
            component.name || 'this component',
            position,
            () => {
              DeleteComponentAction(component);
              ShowSuccessToast('Component deleted');
              closeMenu?.();
            },
            ()=>{
              closeMenu?.();
            }
          );
        } else if (type === "page" && page) {
          closeMenu?.();
          ShowDeleteConfirm(
            page.name || 'this page',
            position,
            () => {
              deletePage(page);
              ShowSuccessToast('Page deleted');
            }
          );
        }
      } else if(EventData.action === "copy"){
        closeMenu?.();
        eventHandler.emit("Copy")
      } else if(EventData.action === "copyComponentName"){
        const component = EventData.value?.component;
        if(component?.name){
          navigator.clipboard.writeText(component.name).then(() => {
            closeMenu?.();
            ShowSuccessToast('Component name copied to clipboard');
          });
        }
      }
    `
  }
};
