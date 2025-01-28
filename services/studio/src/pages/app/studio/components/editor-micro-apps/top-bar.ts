import { ComponentType } from "$store/component/interface.ts";

export default [{
  uuid: "top-bar",
  applicationId: "1",
  application_id: "1",
  name: "top bar",
  component_type: ComponentType.Container,

  style: {
    width: "100vw",
    "align-items": "center"
  },
  childrenIds: ["info-top-bar", "settings-top-bar"]
},
  {
    uuid: "info-top-bar",
    name: "info top bar",
    applicationId: "1",
    component_type: ComponentType.Container,
    style: {
      width: "50vw",
      display: "flex",
      "justify-content": "space-between",
      "align-items": "center"
    },
    childrenIds: ["app_details_top_bar", "app-page-top-bar"]
  },
  {
    uuid: "app_details_top_bar",
    name: "details top bar",
    applicationId: "1",


    component_type: ComponentType.Container,
    style: {
      "align-items": "center",
      "gap": "5px"
    },
    childrenIds: ["app_back_top_bar", "app_name_top_bar", "app_insert_top_bar", "prototype_ai_top_bar",]
  },
  {
    uuid: "app_insert_top_bar",
    name: "app insert top bar",
    applicationId: "1",

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
                  value: "text_label",
                  icon:'i-cursor'
                },
                {
                  label: "Table",
                  value: "Table",
                  icon:'table'
                },
                {
                  label: "Checkbox",
                  value: "checkbox",
                  icon:'square-check'
                },
                {
                  label: "Select",
                  value: "select",
                  icon:'th-list'
                },
                {
                  label: "DatePicker",
                  value: "DatePicker",
                  icon:'calendar'
                },
                {
                  label: "Icon",
                  value: "Icon",
                  icon:'icons'
                },
                {
                  label: "Image",
                  value: "Image",
                  icon:'image'
                },
                {
                  label: "MicroApp",
                  value: "MicroApp",
                  icon: "cube"
                },
                {
                  label: "Collections",
                  value: "Collection",
                  icon: "layer-group"
                },
                {
                  label: "Text Input",
                  value: "text_input",
                  icon:'pen-to-square'
                },
                {
                  label: "Button", //vertical-container-block
                  value: "button_input",
                  icon:'smile'
                },
                { type: "divider" },
                {
                  label: "Vertical Container", //
                  value: "vertical-container-block",
                  icon:'grip-vertical'
                },
              ];
            return options;
            `
      }
    },
    event: {
      onClick: /* js */ `
            const currentEditingApplication = GetVar("currentEditingApplication");
            const appPages = GetContextVar(currentEditingApplication?.uuid + ".appPages", currentEditingApplication.uuid);
            const currentPage = GetVar("currentPage") || appPages[0]?.uuid;
           if(currentPage){
            AddComponent(currentEditingApplication.uuid,currentPage,EventData.value)
           }
          `
    }
  },
  {
    uuid: "app_back_top_bar",
    name: "app name top bar",
    applicationId: "1",

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
        value: /* js */`
            return '';
            `
      },
      icon: {
        type: "handler",
        value: /* js */`
            return 'chevron-left';
            `
      }
    },
    event: {
      onClick: /* js */ `
         window.location.href = '/dashboard'
       
          `
    }
  },
  {
    uuid: "platform_name_top_bar",
    name: "app name top bar",
    applicationId: "1",

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
    applicationId: "1",

    component_type: ComponentType.TextLabel,
    style: {
      "border-left": "1px solid grey",
      "padding-left": "8px"
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
    applicationId: "1",

    component_type: ComponentType.Container,
    style: {
      width: "50vw",
      "justify-content": "flex-end",
      "align-items": "center"

    },
    childrenIds: ["mode_topbar", "platform_top_bar", "zoom_top_bar", "prev_next_top_bar", "app_users_top_bar", "app_preview_publish_top_bar", "app_logout_top_bar"]
  },
  {
    uuid: "zoom_top_bar",
    name: "zoom top bar",
    applicationId: "1",

    component_type: ComponentType.Container,
    style: {
      "min-height": "40px",
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
    applicationId: "1",

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
    applicationId: "1",

    component_type: ComponentType.Container,
    style: {
      "min-height": "40px",
      "margin-right": "4px",
      "align-items": "center"
    },
    childrenIds: ["users_dropdown"]
  },
  {
    uuid: "users_dropdown",
    name: "users dropdown",
    applicationId: "1",

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
        value: /* js */`
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
    applicationId: "1",

    component_type: ComponentType.Container,
    style: {
      "min-height": "40px",
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
    applicationId: "1",

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
    applicationId: "1",

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
    applicationId: "1",

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
    applicationId: "1",

    component_type: ComponentType.Container,
    style: {
      "min-height": "40px",
      "margin-right": "4px",
      "justify-content": "space-between",
      "align-items": "center"
    },
    childrenIds: ["primary_platform_container", "tablet_platform_container", "mobile_platform_container"]

  },
  {
    uuid: "primary_platform_container",
    name: "primary platform container",
    applicationId: "1",

    component_type: ComponentType.Container,
    style: {
      "flex-direction": "column",
      "align-items": "center"
    },
    childrenIds: ["primary_platform_button"]

  },
  {
    uuid: "primary_platform_button",
    name: "primary platform button",
    applicationId: "1",

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
    applicationId: "1",

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
    applicationId: "1",

    component_type: ComponentType.Container,
    style: {
      "flex-direction": "column",
      "align-items": "center"
    },
    childrenIds: ["tablet_platform_button",]

  },
  {
    uuid: "tablet_platform_button",
    name: "tablet platform button",
    applicationId: "1",

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
    applicationId: "1",

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
    applicationId: "1",

    component_type: ComponentType.Container,
    style: {
      "flex-direction": "column",
      "align-items": "center"
    },
    childrenIds: ["mobile_platform_button"]

  },
  {
    uuid: "mobile_platform_button",
    name: "mobile platform button",
    applicationId: "1",

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
    applicationId: "1",

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
    applicationId: "1",

    component_type: ComponentType.Container,
    style: {
      "gap": "5px",
      "margin-right": "4px",
      "min-height": "40px",
      "align-items": "center",
      "border-left": "1px solid grey",
      "border-right": "1px solid grey"

    },
    childrenIds: ["next_button", "previous_button"]

  },
  {
    uuid: "previous_button",
    name: "previous button",
    applicationId: "1",

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
    applicationId: "1",

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
    applicationId: "1",

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
    applicationId: "1",

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
    applicationId: "1",

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
    applicationId: "1",

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
    applicationId: "1",

    component_type: ComponentType.TextLabel,
    style: {
      "margin-left": "15px"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
            const currentEditingApplication = GetVar("currentEditingApplication");
            const appPages = GetContextVar(currentEditingApplication?.uuid + ".appPages", currentEditingApplication.uuid);
            const currentPage = GetVar("currentPage") || appPages[0]?.uuid;
            const currentPageName = appPages.find((page)=>page.uuid == currentPage).name
            return currentPageName;
            `
      }
    }
  }];