import { ComponentType } from "$store/component/interface.ts";

export default {
  uuid: "right_panel_tabs",
  application_id: "1",
  name: "right_panel_tabs",
  component_type: ComponentType.Tabs,
  event: {},
  style: {
    width: "100%",
    height: "100%",
    display: "grid",
    "--hybrid-tabs-content-padding": "0px",
    "--hybrid-button-font-size": "12px",
    "--text-label-dark-color": "#c2c2c2",
    "--hybrid-tabs-container-box-shadow":" 2px 0px 5px 0px #dbdbdbbf",
    "--hybrid-tabs-border-radius": "8px",
  },
  input: {
    tabs: {
      type: "handler",
      value: /* js */ `
                const selectedComponents = GetVar("selectedComponents") || [];
                const currentPageId = GetVar("currentPage");
                const currentEditingApplication = GetVar("currentEditingApplication");
                let parameters = [];
                let handlers = [];
                let themes = [];
                if(selectedComponents.length)
                    { 
                        const component = GetComponent(selectedComponents[0],currentEditingApplication.uuid);
                    switch(component?.component_type){
                        case "text_label":
                            parameters=[
                               "text_label_bocks"
                            ];
                            handlers=[
                                "text_label_handler"
                            ];
                            themes=[
                            "parent_color_container"];
                            break;
                        case "text_input":
                            parameters=[
                                'text_input_blocks'
                            ];
                            handlers=[
                                "studio_text_input_handler"
                            ];
                            themes = [
                                "text_input_icon_theme_container"
                            ]
                            break;
                        case "button_input":
                            parameters=[
                                'buttons_bocks'
                            ];
                            handlers=[
                                "studio_button_handler"
                            ];
                            themes =[
                              "studio_button_theme_container"
                            ];
                            break;
                        case "checkbox":
                            parameters=[
                              "checkbox_blocks"
                            ];
                            handlers=[
                              "studio_checkbox_handler"
                            ];
                            themes =[
                                "checkbox_button_theme_container",
                            ];
                                break;
                        case "Image":
                            parameters=[
                                      'image_blocks'
                                        ];
                                        handlers=[
                                            "studio_image_handler"
                                        ];
                                        break;
                        case "Datepicker":
                            parameters=[
                                "datepicker_block",
                                        ];
                                        handlers=[
                                            "studio_datepicker_handler"
                                        ];
                                        break;
                                        
                        case "select":
                            parameters=[
                                "select_blocks"
                            ]
                             handlers=[
                              "studio_select_handler"
                            ];
                            break;
                           
                        
                        case "Table":
                            parameters=[
                                "table_blocks"
                            ];
                            handlers=[
                            "studio_table_handler"
                            ];
                            break;
                        case "Icon":
                            parameters=[
                                "icon_blocks"
                            ];
                            handlers=[
                            "studio_icon_handler"
                            ];
                            themes=[
                                "studio_icon_theme_container"
                            ];
                            break;
                        case "vertical-container-block":
                            parameters=[
                                "container_blocks"
                            ]
                            handlers=[
                                "studio_container_handler"
                            ];
                            themes=[
                                "studio_container_theme_container"
                            ];
                            break;

                        case "Collection":
                            parameters=[
                                "collection_blocks",
                            ]
                            handlers=[
                                "studio_collection_handler"
                            ];
                            break;
                    }
                }
                else if(currentPageId) {
                        parameters=[
                            "page_name_block", 
                            "page_url_block"    
                        ]
                }
                return [
                 
                    {
                        label: {
                            type: "text",
                            value: "Design"
                        },
                        childrends: {
                            type: "componentIdArray",
                            value: selectedComponents.length|| currentPageId
                                ? parameters
                                : ["select_component_text"]
                        }
                    },
                   {
                        label: {
                            type: "text",
                            value: "Handlers"
                        },
                        childrends: {
                            type: "componentIdArray",
                            value:  selectedComponents.length|| currentPageId
                                ? handlers
                                : []
                        }
                    },
                    {
                        label: {
                            type: "text",
                            value: "Theme"
                        },
                        childrends: {
                            type: "componentIdArray",
                            value:  selectedComponents.length|| currentPageId
                                ? themes
                                : []
                        }
                    }
                ];
                `
    }
  }
};
