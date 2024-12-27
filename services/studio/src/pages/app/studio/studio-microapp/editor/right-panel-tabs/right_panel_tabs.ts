import { ComponentType } from "$store/component/interface.ts";

export default {
  uuid: "right_panel_tabs",
  applicationId: "1",
  name: "right_panel_tabs",
  component_type: ComponentType.Tabs,
  event: {},
  style: {
    width: "100%",
    height: "100%",
    display: "grid",
    "--hybrid-tabs-content-padding": "0px"
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
                    switch(component.component_type){
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
                                "value_text_block",
                                "helper_text_block",
                                "label_text_block",
                                "input_label_color_block",
                                "input_label_font_size_vertical_container",
                                "input_helper_color_block",
                                "input_helper_font_size_vertical_container",
                                "placeholder_text_block",
                                "position_collapse_container",
                                "width_vertical_container",
                                "size_block",
                                "input_type_block",
                                "status_block",
                                "state_block",
                                "input_blur_event_block",
                                "input_valuechange_event_block",
                                "input_focus_event_block"
                            ];
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
                                break;
                        case "Image":
                            parameters=[
                                      'image_blocks'
                                        ];
                                        break;
                        case "DatePicker":
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
                            break;
                        case "vertical-container-block":
                            parameters=[
                                "container_blocks"
                            ]
                            break;

                        case "Collection":
                            parameters=[
                                "collection_blocks",
                            ]
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
