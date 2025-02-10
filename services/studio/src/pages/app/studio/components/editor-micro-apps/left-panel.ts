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
    display: "grid"
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
      height: "100%"
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
    childrenIds: ["remove_page", "add_page"]
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
    uuid: "remove_page",
    name: "remove page",
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
            const removePageLabelBtn='';
            return removePageLabelBtn;
        `
      },
      icon: {
        type: "handler",
        value: /* js */`
            const removePageIcon='trash';
            return removePageIcon;
        `
      }
    },

    event: {
      /* js */
      onClick: `
        try {
           
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
      "--hybrid-menu-font-size": "14px",
      "--hybrid-sub-menu-padding-y": "4px",
      "--hybrid-menu-link-padding-y": "4px"
    },
    input: {
      options: {
        type: "handler",
        value: /* js */ `
            const currentEditingApplication = GetVar("currentEditingApplication");
            const appPages = GetContextVar(currentEditingApplication?.uuid + ".appPages", currentEditingApplication?.uuid);
            const currentPage = GetVar("currentPage") || appPages?.[0]?.uuid;
            const currentComponent= GetVar("selectedComponents");
            
            if(!appPages) {
                 [];
            }else{
                function findChildren(appId,children,childrenIds){
                    childrenIds.map((componentId)  => {
                        const component= GetComponent(componentId,appId);
                        if(!component){
                            return;
                        }
                        const componentChildrenIds = component?.childrenIds;
                        let componentIcon='smile';
                        switch(component.component_type){
                            case 'text_label':
                                componentIcon="i-cursor";
                                break;
                            case 'select':
                                componentIcon='th-list';
                                break;
                            case 'checkbox':
                                componentIcon='square-check';
                                break;
                            case 'Table':
                                componentIcon='table';
                                break;
                            case 'vertical-container-block':
                                componentIcon='grip-vertical';
                                break;
                            case 'text_input':
                                componentIcon='pen-to-square';
                                break;
                            case 'image':
                                componentIcon='image';
                                break;
                            case 'icon':
                                componentIcon='icons';
                                break;
                            case 'DatePicker':
                                componentIcon='calendar';
                                break;
                        }

                        children.push({
                            text: component.name,
                            icon:componentIcon,
                            id: component.uuid,
                            selected: currentComponent?.length && component.uuid == currentComponent[0],
                            handlerKey: "onSelect",
                        })
                        if(componentChildrenIds){
                            children[children.length-1]={...children[children.length-1],children:[]}
                            findChildren(appId,children[children.length-1].children,componentChildrenIds);
                        }
                        
                    })
                }
            }
       

            return appPages.map((page) => {
                const componentIds = page.component_ids;
                const appId = page.application_id;
                const children = [];

                if (componentIds) {
                    findChildren(appId, children, componentIds);
                }

                return {
                    text: page.name,
                    id: page.uuid,
                    selected: page.uuid === currentPage,
                    icon: 'file',
                    type: "page",
                    handlerKey: "onSelect",
                    children: children
                };
            });

            `
      }
    },
    event: {
      onSelect: /* js */ `
        if(EventData.type === "page"){
                SetVar("currentPage" , EventData.id)
                SetVar("selectedComponents",[])
            }else{
                const componentParentPage = EventData.page;
                const currentPage = GetVar("currentPage")
                if(componentParentPage != currentPage ){
                    SetVar("currentPage" , componentParentPage)
                }
                SetVar("selectedComponents",[EventData.id]);
            }
        `,
      /* js */

      actionClick: `
        try {
           
            
         } catch(e) {
             console.log(e);
         }
         `

    },
  }];