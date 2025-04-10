import { ComponentType } from "$store/component/interface.ts";
import { Edit } from "./top-menu/edit";
import { Insert } from "./top-menu/insert";

export default [{
  uuid: "top-bar",
  application_id: "1",
  name: "top bar",
  component_type: ComponentType.Container,

  style: {
    width: "100vw",
    "height": "40px",
    "--hybrid-button-font-size": "12px",
    "border-bottom": "1px solid #888888",
    "--text-label-dark-color": "#c2c2c2",
    "--container-bg-color": "#26327b",
    "--hybrid-button-ghost-text-color": "white",
    "--text-label-color": "white",

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
    "margin-top": "-1px",
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
    "gap": "5px",
    "height": "38px",
  },
  childrenIds: ["app_logo", "app_back_top_bar", "app_name_top_baré", "prototype_ai_top_bar3", "app_insert_top_bar", "app_edit_top_bar"]
},
{
  uuid: "app_insert_top_bar",
  name: "app insert top bar",
  application_id: "1",
  style: {
    "--text-label-color": "#515151",
    "--hybrid-icon-color": "#515151",
    "title-color": "white",
    "--hybrid-button-hover-background-color": "white",
    // "border-left": "1px solid grey",
    "padding-left": "12px",
    "padding-right": "12px",
  },
  component_type: ComponentType.InsertDropdown,
  input: {
    label: {
      type: "handler",
      value: /* js */`
            return ' Add Component';
            `
    },
    buttonIcon: {
      type: "handler",
      value: /* js */`
            return 'plus';
            `
    },
    title: {
      type: "string",
      value: "Insert"
    },
    options: {
      type: "handler",
      value: Insert
    }
  },
  event: {
    onClick: /* js */ `
    // todo: here
            const currentEditingApplication = GetVar("currentEditingApplication");
            const appPages = GetContextVar(currentEditingApplication?.uuid + ".appPages", currentEditingApplication?.uuid);
            const currentPage = Vars.currentPage || appPages?.[0]?.uuid;
            if(currentPage){
              console.log(EventData.additionalData)
              const action = EventData.additionalData.action;
              delete EventData.additionalData.action;
              if( action == "add"){
                AddComponent({
                  application_id : currentEditingApplication.uuid,
                  pageId : currentPage,
                  componentType : EventData.value,
                  additionalData : EventData.additionalData
                })
             }else if( action == "paste"){
              TraitCompoentFromSchema(EventData.additionalData.schema)
             }
            }
          `
  }
},

{
  uuid: "app_edit_top_bar",
  name: "app insert top bar",
  application_id: "1",
  style: {
    "--text-label-color": "#515151",
    "--hybrid-icon-color": "#515151",
    "title-color": "white",
    "--hybrid-button-hover-background-color": "white",
    // "border-left": "1px solid grey",
    "padding-left": "12px",
    "padding-right": "12px",
  },
  component_type: ComponentType.InsertDropdown,
  input: {
    label: {
      type: "handler",
      value: /* js */`
            return ' Add Component';
            `
    },
    buttonIcon: {
      type: "handler",
      value: /* js */`
            return 'plus';
            `
    },
    title: {
      type: "string",
      value: "Edit"
    },
    options: {
      type: "handler",
      value: Edit
    }
  },
  event: {
    onClick: /* js */ `
            const currentEditingApplication = GetVar("currentEditingApplication");
            const appPages = GetContextVar(currentEditingApplication?.uuid + ".appPages", currentEditingApplication?.uuid);
            const currentPage = Vars.currentPage || appPages?.[0]?.uuid;
           if(currentPage){
            console.log(EventData)
            if(EventData.action == "add"){
              AddComponent({
                application_id : currentEditingApplication.uuid,
                pageId : currentPage,
                componentType : EventData.value,
                additionalData : EventData.additionalData
              })
           }else if(EventData.action == "paste"){
            alert('aaaa')
           }
          }

          `
  }
},
{
  uuid: "app_insert_top_bar2",
  name: "app insert top bar",
  application_id: "1",
  style: {
    "--text-label-color": "black",
    "title-color": "white", "--hybrid-button-hover-background-color": "white",
    "border-left": "1px solid grey",
    "padding-left": "14px",
  },
  component_type: ComponentType.InsertDropdown,
  input: {
    label: {
      type: "handler",
      value: /* js */`
            return ' Add Component';
            `
    },
    buttonIcon: {
      type: "handler",
      value: /* js */`
            return 'plus';
            `
    },
    title: {
      type: "string",
      value: "Insert"
    },
    options: {
      type: "handler",
      value: Insert
    }
  },
  event: {
    onClick: /* js */ `
            const currentEditingApplication = GetVar("currentEditingApplication");
            const appPages = GetContextVar(currentEditingApplication?.uuid + ".appPages", currentEditingApplication?.uuid);
            const currentPage = Vars.currentPage || appPages?.[0]?.uuid;
            if(currentPage){
              console.log(EventData)
              if(EventData.action == "add"){
                AddComponent({
                  application_id : currentEditingApplication.uuid,
                  pageId : currentPage,
                  componentType : EventData.value,
                  additionalData : EventData.additionalData
                })
             }else if(EventData.action == "paste"){
              alert('bbb')
             }
            }
          `
  }
},
{
  uuid: "app_logo",
  name: "app name top bar",
  component_type: ComponentType.Image,
  input: {
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
            return 'data:image/jpeg;base64,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';
            `
    }
  },
  event: {
    onClick: /* js */`
        Navigation.toUrl('/dashboard');
      `
  },
  style: {
    "width": "40px",
    "height": "40px",
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
    "--text-label-color": "#d6d6d6",

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
    // "--text-label-color": "#d6d6d6",

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
  childrenIds: ["mode_topbar", "platform_top_bar", "zoom_top_bar", "prev_next_top_bar", "app_users_top_bar2", "app_preview_publish_top_bar", "app_logout_top_bar"]
},
{
  uuid: "zoom_top_bar",
  name: "zoom top bar",
  application_id: "1",

  component_type: ComponentType.Container, "margin-top": "2px",
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
        Vars.EditorZoom = EventData.value;
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
    value: {
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
    "height": "40px",
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
    "margin-top": "5px",
    "margin-right": "24px",
    "justify-content": "space-between",
    "align-items": "center",
    "border-right": "1px solid grey",
    "padding-right": "14px",
  },
  childrenIds: ["edit_mode", "preview_mode"]

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
    "--hybrid-button-ghost-background-color": "transparent",
    "--hybrid-button-ghost-text-color": "white"
  },
  event: {
    onClick: /* js */`
      Vars.currentEditingMode = "edit";
        `
  },
  input: {
    display: {
      type: "handler",
      value: /* js */`
            return Vars.currentEditingMode  == "preview"
            `
    },
    label: {
      type: "handler",
      value: /* js */`
            const buttonLabel = 'Edit'
            return buttonLabel;
            `
    },
    iconPosition: {
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
    "--hybrid-button-ghost-background-color": "transparent",
    "--resolved-text-label-color": "white"
  },
  event: {
    onClick: /* js */`
      Vars.currentEditingMode = "preview"
        `
  },
  input: {
    display: {
      type: "handler",
      value: /* js */`
            return Vars.currentEditingMode == "edit" || Vars.currentEditingMode == undefined
            `
    },
    label: {
      type: "handler",
      value: /* js */`
            const buttonLabel = 'Preview'
            return buttonLabel;
            `
    },
    iconPosition: {
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
  uuid: "prototype_ai_top_bar2",
  name: "prototype_ai_top_bar2",
  application_id: "1",

  component_type: ComponentType.Button,
  style: {
    "type": "ghost",
    "--hybrid-button-padding-y": "2px",
    "--hybrid-button-padding-x": "2px",
    "--hybrid-button-height": "40px",
    "--hybrid-button-ghost-border-color": "transparent",
    "--hybrid-button-ghost-background-color": "transparent",
    "--text-label-color": "white",
    "border-left": "1px solid grey",
    "padding-left": "14px",
  },
  event: {
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
    iconPosition: {
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
    "margin-top": "7px",
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
  event: {
    onClick: /* js */`
          Vars.currentPlatform =  {
            platform: "desktop",
            width: "100%",
          }
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
    "font-size": "10px",
    "--text-label-color": "#d6d6d6",
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
  event: {
    onClick: /* js */`
      Vars.currentPlatform =  {
        platform: "tablet",
        width: "1024px",
        height: "768px",
        isMobile: true
      }
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
    "font-size": "10px",
    "--text-label-color": "#d6d6d6",
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
  event: {
    onClick: /* js */`
      Vars.currentPlatform =  {
        platform: "mobile",
        width: "430px",
        height: "767px",
        isMobile: true
      }
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
    "margin-top": "2px",
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
  uuid: "app_preview_publish_top_sbar",
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
    "--hybrid-button-padding-y": "9px",
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
    "margin-top": "9px",
    "height": "20px"
    // "--text-label-color": "#d6d6d6",
  },
  event:{
    onInput : /* js */`
    const currentEditingApplication = GetVar("currentEditingApplication");
    currentEditingApplication.name = EventData.value.value;
    console.log(currentEditingApplication)
    currentEditingApplication.uuid
    UpdateApplication({...currentEditingApplication});
    EventData.event.preventDefault();
    EventData.event.stopPropagation();
    `
  },
  input: {
    value: {
      type: "handler",
      value: /* js */`
            const currentEditingApplication = GetVar("currentEditingApplication");
            const appPages = GetContextVar(currentEditingApplication?.uuid + ".appPages", currentEditingApplication?.uuid);
            const currentPage = Vars.currentPage || appPages?.[0]?.uuid;
            const currentPageName = appPages?.find((page)=>page.uuid == currentPage).name

            console.log('currentEditingApplicationcurrentEditingApplication',currentEditingApplication)
            const appName = currentEditingApplication.name;
            return appName;
             return currentPageName;
            `
    }
  }
}];