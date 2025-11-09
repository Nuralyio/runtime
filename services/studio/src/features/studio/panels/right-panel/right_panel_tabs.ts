import { ComponentType } from "@shared/redux/store/component/component.interface";

export default [
{
  uuid: "right_panel_tabs",
  application_id: "1",
  name: "right_panel_tabs",
  component_type: ComponentType.Tabs,
  event: {},
  style: {
    width: "100%",
    height: "100%",
    display: "grid",
    "--nuraly-border-width-tabs-content-top": "0px",
    "--nuraly-border-width-tabs-top": "0px",
    "--nuraly-border-width-tabs-right": "0px",
    "--nuraly-border-width-tabs-bottom": "1px",
    "--nuraly-border-width-tabs-left": "0px",
    "--nuraly-border-width-tabs-top-hover": "0px",
    "--nuraly-border-width-tabs-right-hover": "0px",
    "--nuraly-border-width-tabs-bottom-hover": "1px",
    "--nuraly-border-width-tabs-left-hover": "0px",
    "--nuraly-border-width-tabs-top-active": "0px",
    "--nuraly-border-width-tabs-right-active": "1px",
    "--nuraly-border-width-tabs-bottom-active": "0px",
    "--nuraly-border-width-tabs-left-active": "1px",
    "--nuraly-border-width-tabs-top-focus": "2px",
    "--nuraly-border-width-tabs-right-focus": "2px",
    "--nuraly-border-width-tabs-bottom-focus": "2px",
    "--nuraly-border-width-tabs-left-focus": "2px",
    "--nuraly-tabs-labels-gap": "0px",
    "overflow": "auto"
  },
  input: {
    // index: {
    //     type: "number",
    //     value: 1
    // },
    popOut: {
        type: "object",
        value: {
          enabled: true,
          canPopOut: true,
          canPopIn: true,
          windowPanel: {
            title: '{tabLabel} - Popped Out',
            width: '800px',
            height: '600px',
            resizable: true,
            draggable: true,
            closable: false,
            minimizable: true
          }
        }
      },
    align: { type: "string", value: "stretch" },
    size: { type: "string", value: "small" },
    tabs: {
      type: "handler",
      value: /* js */ `
      Vars.selected_component_style_state
                const selectedComponent = Utils.first(Vars.selectedComponents);
                const currentPageId = Vars.currentPage;
                let parameters = [], handlers = [], themes = ["select_component_text"];
                
                if(selectedComponent) { 
                    const componentConfigs = {
                        "text_label": {
                            parameters: ["text_label_bocks"],
                            handlers: ["text_label_handler"],
                            themes: ["parent_color_container"]
                        },
                        "text_input": {
                            parameters: ["text_input_blocks"],
                            handlers: ["studio_text_input_handler"],
                            themes: ["text_input_icon_theme_container"]
                        },
                        "Textarea": {
                            parameters: ["textarea_blocks"],
                            handlers: ["studio_textarea_handler"],
                            themes: ["textarea_theme_container"]
                        },
                        "Slider": {
                            parameters: ["slider_blocks"],
                            handlers: ["studio_slider_handler"],
                            themes: ["slider_theme_container"]
                        },
                        "button_input": {
                            parameters: ["button_blocks"],
                            handlers: ["studio_button_handler"],
                            themes: ["studio_button_theme_container"]
                        },
                        "checkbox": {
                            parameters: ["checkbox_blocks"],
                            handlers: ["studio_checkbox_handler"],
                            themes: ["checkbox_button_theme_container"]
                        },
                        "Image": {
                            parameters: ["image_blocks"],
                            handlers: ["studio_image_handler"]
                        },
                        "Datepicker": {
                            parameters: ["datepicker_block"],
                            handlers: ["studio_datepicker_handler"],
                            themes: ["studio_datepicker_theme_container"]
                        },
                        "select": {
                            parameters: ["select_blocks"],
                            handlers: ["studio_select_handler"],
                            themes: ["studio_select_theme_container"]
                        },
                        "Table": {
                            parameters: ["table_fields_collapse_container", "table_blocks"],
                            handlers: ["studio_table_handler"],
                            themes: ["select_component_text"]
                        },
                        "Icon": {
                            parameters: ["icon_blocks"],
                            handlers: ["studio_icon_handler"],
                            themes: ["studio_icon_theme_container"]
                        },
                        "Badge": {
                            parameters: ["badge_blocks"],
                            handlers: ["studio_badge_handler"],
                            themes: ["badge_theme_container"]
                        },
                        "Tag": {
                            parameters: ["tag_blocks"],
                            handlers: ["studio_tag_handler"],
                            themes: ["tag_theme_container"]
                        },
                        "vertical-container-block": {
                            parameters: ["container_blocks"],
                            handlers: ["studio_container_handler"],
                            themes: ["studio_container_theme_container"]
                        },
                        "Card": {
                            parameters: ["card_blocks"],
                            handlers: ["studio_card_handler"],
                            themes: ["card_theme_container"]
                        },
                        "Collection": {
                            parameters: ["collection_blocks"],
                            handlers: ["studio_collection_handler"]
                        },
                        "RefComponent": {
                            parameters: ["ref_component_blocks"],
                            handlers: ["studio_ref_component_handler"],
                            themes: ["studio_ref_component_theme_container"]
                        },
                        "code-block": {
                            parameters: ["code_blocks"]
                        },
                        "rich-text": {
                            parameters: ["rich_text_blocks"],
                            handlers: ["studio_rich_text_handler"],
                            themes: ["studio_rich_text_theme_container"]
                        },
                        "rich-text-editor": {
                            parameters: ["rich_text_editor_blocks"],
                            handlers: ["studio_rich_text_editor_handler"],
                            themes: ["studio_rich_text_editor_theme_container"]
                        },
                        "menu": {
                            parameters: ["menu_blocks"],
                            handlers: ["studio_menu_handler"],
                            themes: ["studio_menu_theme_container"]
                        },
                        "dropdown": {
                            parameters: ["dropdown_blocks"],
                            handlers: ["studio_dropdown_handler"],
                            themes: ["studio_dropdown_theme_container"]
                        },
                        "embed-url": {
                            parameters: ["embed_collapse_container"]
                        },
                        "link": {
                            parameters: ["link_collapse_container"],
                            handlers: ["studio_link_handler"],
                            themes: ["studio_link_theme_container"]
                        },
                        "file-upload": {
                            parameters: ["FileUpload_input_collapse_container"],
                            handlers: ["studio_FileUpload_handler"]
                        },
                        "video": {
                            parameters: ["video_collapse_container"],
                            handlers: ["studio_video_handler"]
                        },
                        "document": {
                            parameters: ["document_collapse_container"],
                            handlers: ["studio_document_handler"]
                        }
                    };
                    // prepare select_component_text into themes
                    
                    const config = componentConfigs[selectedComponent?.component_type];
                    if(config) {
                        config.themes.unshift("select_component_styles_state_container");
                        parameters = config.parameters || [];
                        handlers = config.handlers || [];
                        themes = config.themes || [];
                    }
                } else if(currentPageId) {
                    parameters = ["page_name_block", "page_url_block", "description_block"];
                    themes = ["PageThemeStudio"];
                }
                
                return [
                    {
                        label: { type: "text", value: "Properties" },
                        icon: { type: "string", value: "hammer" },
                        childrends: {
                            type: "componentIdArray",
                            value: selectedComponent || currentPageId ? parameters : ["select_component_text"]
                        }
                    },
                    {
                        label: { type: "text", value: "Style" },
                        icon: { type: "string", value: "paintbrush" },
                        childrends: {
                            type: "componentIdArray",
                            value: selectedComponent || currentPageId ? themes : []
                        }
                    },
                    {
                        label: { type: "text", value: "Handlers" },
                        icon: { type: "string", value: "git-compare" },
                        childrends: {
                            type: "componentIdArray",
                            value: selectedComponent || currentPageId ? handlers : []
                        }
                    }
                ];
                `
    },
  }
}];