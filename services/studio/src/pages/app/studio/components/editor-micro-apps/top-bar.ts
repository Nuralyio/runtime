import { ComponentType } from "$store/component/interface.ts";

export default [{
  uuid: "top-bar",
  application_id: "1",
  name: "top bar",
  component_type: ComponentType.Container,

  style: {
    width: "100vw",
    "height": "40px",
  },
  childrenIds: ["info-top-bar", "settings-top-bar"]
},
  {
    uuid: "info-top-bar",
    name: "info top bar",
    application_id: "1",
    component_type: ComponentType.Container,
    style: {
      width: "50vw",
      display: "flex",
      "justify-content": "space-between",
    },
    childrenIds: ["app_details_top_bar", "app-page-top-bar"]
  },
  {
    uuid: "app_details_top_bar",
    name: "details top bar",
    application_id: "1",


    component_type: ComponentType.Container,
    style: {
      "align-items": "center",
      "gap": "5px"
    },
    childrenIds: ["app_logo","app_back_top_bar", "app_name_top_bar", "app_insert_top_bar", "prototype_ai_top_bar",]
  },
  {
    uuid: "app_insert_top_bar",
    name: "app insert top bar",
    application_id: "1",

    component_type: ComponentType.InsertDropdown,
    input: {
      label: {
        type: "handler",
        value: /* js */`
            return '';
            `
      },
      buttonIcon: {
        type: "handler",
        value: /* js */`
            return 'plus';
            `
      },
      buttonType: {
        type: "handler",
        value: /* js */`
            return 'ghost';
            `
      },
      options: {
        type: "handler",
        value: /* js */`
        const options = [
          {
            label: "Text Label",
            value: {
              value: "text_label",
              additionalData: {
                
              },
            },
            icon: "i-cursor",
          },
          {
            label: "Table",
            value: {
              value: "table",
              additionalData: {
                
              },
            },
            icon: "table",
          },
          {
            label: "Checkbox",
            value: {
              value: "checkbox",
              additionalData: {
                
              },
            },
            icon: "square-check",
          },
          {
            label: "Select",
            value: {
              value: "select",
              additionalData: {
                
              },
            },
            icon: "th-list",
          },
          {
            label: "DatePicker",
            value: {
              value: "date_picker",
              additionalData: {
                
              },
            },
            icon: "calendar",
          },
          {
            label: "Icon",
            value: {
              value: "icon",
              additionalData: {
                
              },
            },
            icon: "icons",
          },
          {
            label: "Image",
            value: {
              value: "Image",
              additionalData: {
                style:{
                  width: "100px",
                  height: "100px",
                }
              },
            },
            icon: "image",
          },
          {
            label: "MicroApp",
            value: {
              value: "micro_app",
              additionalData: {
               
              },
            },
            icon: "cube",
          },
          {
            label: "Collections",
            value: {
              value: "collection",
              additionalData: {
                
              },
            },
            icon: "layer-group",
          },
          {
            label: "Text Input",
            value: {
              value: "text_input",
              additionalData: {
                
              },
            },
            icon: "pen-to-square",
          },
          {
            label: "Button",
            value: {
              value: "button_input",
              additionalData: {
                
              },
            },
            icon: "smile",
          },
          { type: "divider" },
          {
            label: "Container",
            value: {
              value: "vertical-container-block",
              additionalData: {
                
              },
            },
            icon: "grip-vertical",
          },
        ];
            return options;
            `
      }
    },
    event: {
      onClick: /* js */ `
            const currentEditingApplication = GetVar("currentEditingApplication");
            const appPages = GetContextVar(currentEditingApplication?.uuid + ".appPages", currentEditingApplication?.uuid);
            const currentPage = GetVar("currentPage") || appPages?.[0]?.uuid;
           if(currentPage){
            AddComponent({
              application_id : currentEditingApplication.uuid,
              pageId : currentPage,
              componentType : EventData.value,
              additionalData : EventData.additionalData
            })
           }
          `
    }
  },
  {
    uuid: "app_logo",
    name: "app name top bar",
    component_type: ComponentType.Image,
    input:{
      darkSrc: {
        type: "handler",
        value: /* js */`
        return "data:image/png;base64,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"
        `
      },
      src:
      {
        type: "handler",
        value: /* js */`
            return 'data:image/png;base64,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';
            `
      }
    },
    style:{
      "width": "30px",
      "height": "30px",
      "margin-left": "11px",
      "margin-top": "4px",
      "display": "block",
    }
  },
  /*{
    uuid: "app_back_top_bar",
    name: "app name top bar",
    application_id: "1",

    component_type: ComponentType.Button,
    style: {
      "margin-left": "5px",
      "type": "ghost",
      "--hybrid-button-padding-y": "2px",
      "--hybrid-button-padding-x": "2px",
      "--hybrid-button-ghost-background-color": "transparent",
      "--hybrid-button-ghost-border-color": "transparent"

    },
    input: {
      label: {
        type: "handler",
        value:`
            return '';
            `
      },
      icon: {
        type: "handler",
        value:`
            return 'chevron-left';
            `
      }
    },
    event: {
      onClick: `
         window.location.href = '/dashboard'
       
          `
    }
  },*/
  {
    uuid: "platform_name_top_bar",
    name: "app name top bar",
    application_id: "1",

    component_type: ComponentType.TextLabel,
    style: {
      "border-left": "1px solid grey",
      "padding-left": "8px",
      "font-family": "Arial",
      "font-weight": "bold",
    },
    input: {
      value: {
        type: "string",
        value: "Nuraly"
      }
    }
  },
  {
    uuid: "app_name_top_bar",
    name: "app name top bar",
    application_id: "1",

    component_type: ComponentType.TextLabel,
    style: {
      // "border-left": "1px solid grey",
      "padding-left": "px"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
            const currentEditingApplication = GetVar("currentEditingApplication");
            const appName = currentEditingApplication?.name;
            return appName;
            `
      }
    }
  },
  {
    uuid: "settings-top-bar",
    name: "settings top bar",
    application_id: "1",

    component_type: ComponentType.Container,
    style: {
      width: "50vw",
      "justify-content": "flex-end",
    },
    childrenIds: ["mode_topbar", "platform_top_bar", "zoom_top_bar", "prev_next_top_bar", "app_users_top_bar", "app_preview_publish_top_bar", "app_logout_top_bar"]
  },
  {
    uuid: "zoom_top_bar",
    name: "zoom top bar",
    application_id: "1",

    component_type: ComponentType.Container,
    style: {
      
      "align-items": "center",
      "justify-content": "center",
      "border-left": "1px solid grey",
      "width": "108px"
    },
    childrenIds: ["zoom_input"]
  },
  {
    uuid: "zoom_input",
    name: "zoom input",
    application_id: "1",

    component_type: ComponentType.TextInput,
    style: {
      "size": "small",
      "--hybrid-input-border-bottom": "none",
      "--hybrid-input-number-icons-container-width": "48px",
      "width": "100px"
    },
    event: {
      valueChange: /* js */`
        SetVar('editor_panel_zoom',EventData.value);
        `
    },
    input: {
      placeholder: {
        type: "handler",
        value: /* js */`
            const inputPlaceholder = 'zoom'
            return inputPlaceholder;
            `
      },
      type: {
        type: "handler",
        value: /* js */`
            const type = 'number'
            return type;

            `
      },
      min: {
        type: "handler",
        value: /* js */`
            const min = '25'
            return min;
            `
      },
      step: {
        type: "handler",
        value: /* js */`
            const min = '10'
            return min;
            `
      },
      max: {
        type: "handler",
        value: /* js */`
            const max = '1600'
            return max;
            `
      },
      value :{
        type: "handler",
        value: /* js */`
            const zoom = GetVar('editor_panel_zoom') || 100;
            return zoom;
            `
      }
    }
  },
  {
    uuid: "app_users_top_bar",
    name: "app users top bar",
    application_id: "1",

    component_type: ComponentType.Container,
    style: {
      "height": "42px",
      "align-self": "center",
      "margin-right": "4px",
    },
    childrenIds: ["users_dropdown"]
  },
  {
    uuid: "users_dropdown",
    name: "users dropdown",
    application_id: "1",

    component_type: ComponentType.UsersDropdown,
    input: {
      userImage: {
        type: "handler",
        value: /* js */`
            const userImage = "https://e7.pngegg.com/pngimages/81/570/png-clipart-profile-logo-computer-icons-user-user-blue-heroes.png";
            return userImage;
            `

      },
      users: {
        type: "handler",
        value: /* js */`
            const usersList = [{label:'Aymen',value:'Aymen'}]
            return usersList;
            `
      },
      imageWidth: {
        type: "handler",
        value: /* js *`
            const imageWidth = '35px';
            return imageWidth;
            `
      },
      imageHeight: {
        type: "handler",
        value: /* js */`
            const imageHeight = '25px';
            return imageHeight;
            `
      }


    }
  },
  
  {
    uuid: "mode_topbar",
    name: "mode_topbar",
    application_id: "1",

    component_type: ComponentType.Container,
    style: {
      
      "margin-right": "24px",
      "justify-content": "space-between",
      "align-items": "center",
      "border-right": "1px solid grey",
      "padding-right": "14px",
    },
    childrenIds: [ "edit_mode", "preview_mode"]

  },
  {
    uuid: "edit_mode",
    name: "edit_mode platform button",
    application_id: "1",

    component_type: ComponentType.Button,
    style: {
      "type": "ghost",
      "--hybrid-button-padding-y": "2px",
      "--hybrid-button-padding-x": "2px",
      "--hybrid-button-height": "40px",
      "--hybrid-button-ghost-border-color": "transparent",
      "--hybrid-button-ghost-background-color": "transparent"
    },
    event:{
      onClick: /* js */`
            SetVar("currentEditingMode" , "edit")
        `
    },
    input: {
      display : {
        type: "handler",
        value: /* js */`
            const isEdit = GetVar("currentEditingMode") == "edit"
            return !isEdit;
            `
      },
      label: {
        type: "handler",
        value: /* js */`
            const buttonLabel = 'Edit'
            return buttonLabel;
            `
      },
      iconPosition:{
        type: "handler",
        value: /* js */`
            const iconPosition = 'left'
            return iconPosition;
            `
      },
      icon: {
        type: "handler",
        value: /* js */`
            const iconName = 'edit'
            return iconName;
            `
      }
    }
  },
  {
    uuid: "preview_mode",
    name: "preview_mode platform button",
    application_id: "1",

    component_type: ComponentType.Button,
    style: {
      "type": "ghost",
      "--hybrid-button-padding-y": "2px",
      "--hybrid-button-padding-x": "2px",
      "--hybrid-button-height": "40px",
      "--hybrid-button-ghost-border-color": "transparent",
      "--hybrid-button-ghost-background-color": "transparent"
    },
    event:{
      onClick: /* js */`
          SetVar("currentEditingMode" , "preview")
        `
    },
    input: {
      display : {
        type: "handler",
        value: /* js */`
            const isEdit = GetVar("currentEditingMode") == "edit"
            return isEdit;
            `
      },
      label: {
        type: "handler",
        value: /* js */`
            const buttonLabel = 'Preview'
            return buttonLabel;
            `
      },
      iconPosition:{
        type: "handler",
        value: /* js */`
            const iconPosition = 'left'
            return iconPosition;
            `
      },
      icon: {
        type: "handler",
        value: /* js */`
            const iconName = 'play-circle'
            return iconName;
            `
      }
    }
  },

  {
    uuid: "prototype_ai_top_bar",
    name: "prototype_ai_top_bar",
    application_id: "1",

    component_type: ComponentType.Button,
    style: {
      "type": "ghost",
      "--hybrid-button-padding-y": "2px",
      "--hybrid-button-padding-x": "2px",
      "--hybrid-button-height": "40px",
      "--hybrid-button-ghost-border-color": "transparent",
      "--hybrid-button-ghost-background-color": "transparent",
      "border-left": "1px solid grey",
      "padding-left": "14px",
    },
    event:{
      onClick: /* js */`
          window.dispatchEvent(new Event('toggle-ai-assistant'));
        `
    },
    input: {
      
      label: {
        type: "handler",
        value: /* js */`
            const buttonLabel = 'Prototype with AI'
            return buttonLabel;
            `
      },
      iconPosition:{
        type: "handler",
        value: /* js */`
            const iconPosition = 'left'
            return iconPosition;
            `
      },
      icon: {
        type: "handler",
        value: /* js */`
            const iconName = 'feather-alt'
            return iconName;
            `
      }
    }
  },


  {
    uuid: "platform_top_bar",
    name: "platform top bar",
    application_id: "1",

    component_type: ComponentType.Container,
    style: {
      
      "margin-right": "4px",
      "justify-content": "space-between",
    },
    childrenIds: ["primary_platform_container", "tablet_platform_container", "mobile_platform_container"]

  },
  {
    uuid: "primary_platform_container",
    name: "primary platform container",
    application_id: "1",

    component_type: ComponentType.Container,
    style: {
      "flex-direction": "column",
    },
    childrenIds: ["primary_platform_button"]

  },
  {
    uuid: "primary_platform_button",
    name: "primary platform button",
    application_id: "1",

    component_type: ComponentType.Button,
    style: {
      "type": "ghost",
      "--hybrid-button-padding-y": "2px",
      "--hybrid-button-padding-x": "2px",
      "--hybrid-button-width": "30px",
      "--hybrid-button-height": "40px",
      "--hybrid-button-ghost-border-color": "transparent",
      "--hybrid-button-ghost-background-color": "transparent"
    },
    event:{
      onClick: /* js */`
          SetVar("currentPlatform" , {
            platform: "desktop",
            width: "100%",
          })
        `
    },
    input: {
      label: {
        type: "handler",
        value: /* js */`
            const buttonLabel = ''
            return buttonLabel;
            `
      },
      icon: {
        type: "handler",
        value: /* js */`
            const iconName = 'display'
            return iconName;
            `
      }
    }
  },
  {
    uuid: "primary_platform_text",
    name: "app name top bar",
    application_id: "1",

    component_type: ComponentType.TextLabel,
    style: {
      "font-size": "10px"
    },
    input: {
      value: {
        type: "string",
        value: 'Primary'
      }
    }
  },
  {
    uuid: "tablet_platform_container",
    name: "tablet platform container",
    application_id: "1",

    component_type: ComponentType.Container,
    style: {
      "flex-direction": "column",
    },
    childrenIds: ["tablet_platform_button",]

  },
  {
    uuid: "tablet_platform_button",
    name: "tablet platform button",
    application_id: "1",

    component_type: ComponentType.Button,
    style: {
      "type": "ghost",
      "--hybrid-button-padding-y": "2px",
      "--hybrid-button-padding-x": "2px",
      "--hybrid-button-width": "30px",
      "--hybrid-button-height": "40px",
      "--hybrid-button-ghost-border-color": "transparent",
      "--hybrid-button-ghost-background-color": "transparent"
    },
    event:{
      onClick: /* js */`
      SetVar("currentPlatform" , {
        platform: "tablet",
        width: "1024px",
        height: "768px",
        isMobile: true
      })
        `
    },
    input: {
      label: {
        type: "handler",
        value: /* js */`
            const buttonLabel = ''
            return buttonLabel;
            `
      },
      icon: {
        type: "handler",
        value: /* js */`
            const iconName = 'tablet'
            return iconName;
            `
      }
    }
  },
  {
    uuid: "tablet_platform_text",
    name: "app name top bar",
    application_id: "1",

    component_type: ComponentType.TextLabel,
    style: {
      "font-size": "10px"
    },
    input: {
      value: {
        type: "string",
        value: 'Tablet'
      }
    }
  },
  {
    uuid: "mobile_platform_container",
    name: "mobile platform container",
    application_id: "1",

    component_type: ComponentType.Container,
    style: {
      "flex-direction": "column",
    },
    childrenIds: ["mobile_platform_button"]

  },
  {
    uuid: "mobile_platform_button",
    name: "mobile platform button",
    application_id: "1",

    component_type: ComponentType.Button,
    style: {
      "type": "ghost",
      "--hybrid-button-padding-y": "2px",
      "--hybrid-button-padding-x": "2px",
      "--hybrid-button-width": "30px",
      "--hybrid-button-height": "40px",
      "--hybrid-button-ghost-border-color": "transparent",
      "--hybrid-button-ghost-background-color": "transparent"
    },
    event:{
      onClick: /* js */`
      SetVar("currentPlatform" , {
        platform: "mobile",
        width: "375px",
        height: "767px",
        isMobile: true
      })
        `
    },
    input: {
      label: {
        type: "handler",
        value: /* js */`
            const buttonLabel = ''
            return buttonLabel;
            `
      },
    
      icon: {
        type: "handler",
        value: /* js */`
            const iconName = 'mobile'
            return iconName;
            `
      }
    }
  },
 
  {
    uuid: "mobile_platform_text",
    name: "app name top bar",
    application_id: "1",

    component_type: ComponentType.TextLabel,
    style: {
      "font-size": "10px"
    },
    input: {
      value: {
        type: "string",
        value: 'Mobile'
      }
    }
  },
  {
    uuid: "prev_next_top_bar",
    name: "prev next top bar",
    application_id: "1",

    component_type: ComponentType.Container,
    style: {
      "gap": "5px",
      "margin-right": "4px",
      
      "align-items": "center",
      "border-left": "1px solid grey",
      "border-right": "1px solid grey",
      "height": "35px"

    },
    childrenIds: ["next_button", "previous_button"]

  },
  {
    uuid: "previous_button",
    name: "previous button",
    application_id: "1",

    component_type: ComponentType.Button,
    style: {
      "type": "ghost",
      "margin-right": "4px",
      "--hybrid-button-padding-y": "2px",
      "--hybrid-button-padding-x": "2px",
      "--hybrid-button-ghost-border-color": "transparent",
      "--hybrid-button-ghost-background-color": "transparent"
    },
    input: {
      label: {
        type: "handler",
        value: /* js */`
            const buttonLabel = ''
            return buttonLabel;
            `
      },
      icon: {
        type: "handler",
        value: /* js */`
            const iconName = 'share'
            return iconName;
            `
      }
    }
  },
  {
    uuid: "next_button",
    name: "next button",
    application_id: "1",

    component_type: ComponentType.Button,
    style: {
      "type": "ghost",
      "margin-left": "4px",
      "--hybrid-button-padding-y": "2px",
      "--hybrid-button-padding-x": "2px",
      "--hybrid-button-ghost-border-color": "transparent",
      "--hybrid-button-ghost-background-color": "transparent"
    },
    input: {
      label: {
        type: "handler",
        value: /* js */`
            const buttonLabel = ''
            return buttonLabel;
            `
      },
      icon: {
        type: "handler",
        value: /* js */`
            const iconName = 'reply'
            return iconName;
            `
      }
    }
  },
  {
    uuid: "app_preview_publish_top_bar",
    name: "app preview publish top bar",
    application_id: "1",

    component_type: ComponentType.Container,
    style: {
      "gap": "5px",
      "height": "55px",
      "margin-right": "12px",
      "align-items": "center",
      "border-right": "1px solid gray",
      "padding-right": "4px"
    },
    childrenIds: ["preview_button", "publish_button"]

  },
  {
    uuid: "preview_buttona",
    name: "preview button",
    application_id: "1",

    component_type: ComponentType.Button,
    style: {
      "type": "ghost",
      "--hybrid-button-padding-y": "2px",
      "--hybrid-button-padding-x": "2px",
      "--hybrid-button-ghost-border-color": "transparent",
      "--hybrid-button-ghost-background-color": "transparent"

    },
    input: {
      label: {
        type: "handler",
        value: /* js */`
            const appName = 'Live preview'
            return appName;
            `
      }
    }
  },
  {
    uuid: "publish_buttona",
    name: "preview button",
    application_id: "1",

    component_type: ComponentType.Button,
    style: {
      "type": "ghost",
      "--hybrid-button-padding-y": "2px",
      "--hybrid-button-padding-x": "2px",
      "--hybrid-button-ghost-border-color": "transparent",
      "--hybrid-button-ghost-background-color": "transparent"
    },
    input: {
      label: {
        type: "handler",
        value: /* js */`
            const appName = 'Publish'
            return appName;
            `
      }
    }
  },
  {
    uuid: "app_logout_top_bar",
    application_id: "1",

    name: "logout",
    component_type: ComponentType.Button,
    style: {
      "--hybrid-button-padding-y": "2px",
      "--hybrid-button-padding-x": "2px",
      "margin-right": "5px",
      "type": "ghost",
      "--hybrid-button-ghost-border-color": "transparent",
      "--hybrid-button-ghost-background-color": "transparent"
    },
    input: {
      label: {
        type: "handler",
        value: /* js */`
            const buttonLabel = 'Logout'
            return buttonLabel;
            `
      },
      icon: {
        type: "handler",
        value: /* js */`
            const iconName = 'sign-out-alt'
            return iconName;
            `
      }
    },
    event: {
      onClick: /* js */ `
        window.location.href = "/logout";
         `
    }
  },

  {
    uuid: "app-page-top-bar",
    name: "app page top bar",
    application_id: "1",

    component_type: ComponentType.TextLabel,
    style: {
      "margin-left": "15px",
      "margin-top": "5px",
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
            const currentEditingApplication = GetVar("currentEditingApplication");
            const appPages = GetContextVar(currentEditingApplication?.uuid + ".appPages", currentEditingApplication?.uuid);
            const currentPage = GetVar("currentPage") || appPages?.[0]?.uuid;
            const currentPageName = appPages?.find((page)=>page.uuid == currentPage).name
            return currentPageName;
            `
      }
    }
  }];