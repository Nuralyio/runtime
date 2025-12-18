export default [
{
  uuid: "right_panel_tabs",
  application_id: "1",
  name: "right_panel_tabs",
  component_type: "tabs",
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
      "--nuraly-spacing-tabs-content-padding-small": 0,
    "overflow-y": "auto"
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
                            parameters: ["text_label_properties_collapse"],
                            handlers: ["text_label_handler"],
                            themes: ["text_label_theme_container", "border_manager_collapse", "box_model_collapse"]
                        },
                        "text_input": {
                            parameters: ["text_input_blocks"],
                            handlers: ["studio_text_input_handler"],
                            themes: ["text_input_icon_theme_container", "border_manager_collapse", "box_model_collapse"]
                        },
                        "Textarea": {
                            parameters: ["textarea_blocks"],
                            handlers: ["studio_textarea_handler"],
                            themes: ["textarea_theme_container", "border_manager_collapse", "box_model_collapse"]
                        },
                        "Slider": {
                            parameters: ["slider_blocks"],
                            handlers: ["studio_slider_handler"],
                            themes: ["slider_theme_container", "border_manager_collapse", "box_model_collapse"]
                        },
                        "button_input": {
                            parameters: ["button_blocks"],
                            handlers: ["studio_button_handler"],
                            themes: ["studio_button_theme_container", "border_manager_collapse", "box_model_collapse"]
                        },
                        "checkbox": {
                            parameters: ["checkbox_blocks"],
                            handlers: ["studio_checkbox_handler"],
                            themes: ["checkbox_button_theme_container", "border_manager_collapse", "box_model_collapse"]
                        },
                        "Image": {
                            parameters: ["image_blocks"],
                            handlers: ["studio_image_handler"],
                            themes: ["border_manager_collapse", "box_model_collapse"]
                        },
                        "Datepicker": {
                            parameters: ["datepicker_block"],
                            handlers: ["studio_datepicker_handler"],
                            themes: ["studio_datepicker_theme_container", "border_manager_collapse", "box_model_collapse"]
                        },
                        "select": {
                            parameters: ["select_blocks"],
                            handlers: ["studio_select_handler"],
                            themes: ["studio_select_theme_container", "border_manager_collapse", "box_model_collapse"]
                        },
                        "Table": {
                            parameters: ["table_blocks"],
                            handlers: ["studio_table_handler"],
                            themes: ["studio_table_theme_container", "border_manager_collapse", "box_model_collapse"]
                        },
                        "Icon": {
                            parameters: ["icon_blocks"],
                            handlers: ["studio_icon_handler"],
                            themes: ["studio_icon_theme_container", "border_manager_collapse", "box_model_collapse"]
                        },
                        "Badge": {
                            parameters: ["badge_blocks"],
                            handlers: ["studio_badge_handler"],
                            themes: ["badge_theme_container", "border_manager_collapse", "box_model_collapse"]
                        },
                        "Tag": {
                            parameters: ["tag_blocks"],
                            handlers: ["studio_tag_handler"],
                            themes: ["tag_theme_container", "border_manager_collapse", "box_model_collapse"]
                        },
                        "vertical-container-block": {
                            parameters: ["container_blocks"],
                            handlers: ["studio_container_handler"],
                            themes: ["studio_container_theme_container", "border_manager_collapse", "box_model_collapse"]
                        },
                        "Card": {
                            parameters: ["card_blocks"],
                            handlers: ["studio_card_handler"],
                            themes: ["card_theme_container", "border_manager_collapse", "box_model_collapse"]
                        },
                        "Collection": {
                            parameters: ["collection_blocks"],
                            handlers: ["studio_collection_handler"],
                            themes: ["border_manager_collapse", "box_model_collapse"]
                        },
                        "RefComponent": {
                            parameters: ["ref_component_blocks"],
                            handlers: ["studio_ref_component_handler"],
                            themes: ["studio_ref_component_theme_container", "border_manager_collapse", "box_model_collapse"]
                        },
                        "code-block": {
                            parameters: ["code_blocks"],
                            handlers: ["studio_code_handler"],
                            themes: ["border_manager_collapse", "box_model_collapse"]
                        },
                        "rich-text": {
                            parameters: ["rich_text_blocks"],
                            handlers: ["studio_rich_text_handler"],
                            themes: ["studio_rich_text_theme_container", "border_manager_collapse", "box_model_collapse"]
                        },
                        "rich-text-editor": {
                            parameters: ["rich_text_editor_blocks"],
                            handlers: ["studio_rich_text_editor_handler"],
                            themes: ["studio_rich_text_editor_theme_container", "border_manager_collapse", "box_model_collapse"]
                        },
                        "menu": {
                            parameters: ["menu_blocks"],
                            handlers: ["studio_menu_handler"],
                            themes: ["studio_menu_theme_container", "border_manager_collapse", "box_model_collapse"]
                        },
                        "dropdown": {
                            parameters: ["dropdown_blocks"],
                            handlers: ["studio_dropdown_handler"],
                            themes: ["studio_dropdown_theme_container", "border_manager_collapse", "box_model_collapse"]
                        },
                        "embed-url": {
                            parameters: ["embed_blocks"],
                            handlers: ["studio_embed_handler"],
                            themes: ["border_manager_collapse", "box_model_collapse"]
                        },
                        "link": {
                            parameters: ["link_blocks"],
                            handlers: ["studio_link_handler"],
                            themes: ["border_manager_collapse", "box_model_collapse"]
                        },
                        "file-upload": {
                            parameters: ["FileUpload_input_collapse_container"],
                            handlers: ["studio_FileUpload_handler"],
                            themes: ["border_manager_collapse", "box_model_collapse"]
                        },
                        "video": {
                            parameters: ["video_blocks"],
                            handlers: ["studio_video_handler"],
                            themes: ["border_manager_collapse", "box_model_collapse"]
                        },
                        "document": {
                            parameters: ["document_blocks"],
                            handlers: ["studio_document_handler"],
                            themes: ["border_manager_collapse", "box_model_collapse"]
                        },
                        "grid-row-block": {
                            parameters: ["grid_row_blocks"],
                            handlers: ["studio_grid_row_handler"],
                            themes: ["studio_grid_row_theme_container", "border_manager_collapse", "box_model_collapse"]
                        },
                        "grid-col-block": {
                            parameters: ["grid_col_blocks"],
                            handlers: ["studio_grid_col_handler"],
                            themes: ["studio_grid_col_theme_container", "border_manager_collapse", "box_model_collapse"]
                        },
                        "form": {
                            parameters: ["form_blocks"],
                            handlers: ["studio_form_handler"],
                            themes: ["form_theme_container", "border_manager_collapse", "box_model_collapse"]
                        }
                    };
                    // prepare select_component_text into themes
                    
                    const config = componentConfigs[selectedComponent?.component_type];
                    if(config) {
                        // Create new arrays instead of mutating originals
                        parameters = [...(config.parameters || []), "access_control_panel_block"];
                        handlers = [...(config.handlers || [])];
                        themes = ["select_component_styles_state_container", ...(config.themes || [])];
                        console.log('[DEBUG] Component parameters order:', parameters);
                    }
                } else if(currentPageId) {
                    parameters = ["page_info_container_block", "access_control_panel_block"];
                    themes = ["PageThemeStudio"];
                    console.log('[DEBUG] Page parameters order:', parameters);
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