

export const Insert = /* js */`
        const dataOptions = [
          {
            id: "table",
            label: "Table",
            value: {
              value: "Table",
              additionalData: {
              action: "add",
              style:{
                  width: "500px",
              }
              },
            },
            icon: "table",
          },

          {
            id: "collections",
            label: "Collections",
            value: {
              value: "Collection",
              additionalData: {
              action: "add",
              style:{
                  width: "400px",
              }
              },
            },
            icon: "database",
          },
        ];
        const mediaOptions = [
          {
            id: "image",
            label: "Image",
            value: {
              value: "Image",
              additionalData: {
              action: "add",                
              style:{
                  width: "100px",
                  height: "100px",
                }
              },
            },
            icon: "image",
          },
           {
            id: "video",
            label: "Video",
            value: {
              value: "video",
              additionalData: {
              action: "add",                
              style:{
                  width: "400px",
                  height: "400px",
                }
              },
            },
            icon: "video",
          },
           {
            id: "document",
            label: "Document",
            value: {
              value: "document",
              additionalData: {
              action: "add",                
              style:{
                  width: "400px",
                  height: "400px",
                }
              },
            },
            icon: "asterisk",
          },
        ]

        const applicationOptions = [
           
          {
            id: "microapp",
            label: "MicroApp",
            value: {
              value: "MicroApp",
              additionalData: {
              action: "add",
              style:{
                  width: "300px",
              }
              },
            },
            icon: "microchip",
          },
        ];

        const layoutOptions = [
          {
            id: "container",
            label: "Container",
            value: {
              value: "vertical-container-block",
              additionalData: {
              action: "add",
              style:{
                  width: "300px",
              }
              },
            },
            icon: "grip-vertical",
          },
          {
            id: "modal",
            label: "Modal",
            value: {
              value: "modal-block",
              additionalData: {
              action: "add",
              input: {
                "open": {
                  "type": "static",
                  "value": false
                },
                "modalTitle": {
                  "type": "static",
                  "value": "Modal Title"
                },
                "size": {
                  "type": "static",
                  "value": "medium"
                }
              },
              style:{
                  width: "auto",
              }
              },
            },
            icon: "square-stack",
          },
          {
            id: "grid-row",
            label: "Grid Row",
            value: {
              value: "grid-row-block",
              additionalData: {
              action: "add",
              input: {
                "gutter": {
                  "type": "number",
                  "value": 16
                },
                "wrap": {
                  "type": "boolean",
                  "value": true
                }
              },
              style:{
                  width: "100%",
              }
              },
            },
            icon: "rows-3",
          },
          {
            id: "grid-col",
            label: "Grid Col",
            value: {
              value: "grid-col-block",
              additionalData: {
              action: "add",
              input: {
                "span": {
                  "type": "number",
                  "value": 12
                }
              },
              style:{
                  minHeight: "60px",
              }
              },
            },
            icon: "columns-3",
          },
          {
            id: "ref-component",
            label: "Ref Component",
            value: {
              value: "RefComponent",
              additionalData: {
              action: "add",
              style:{
                  width: "250px",
              }
              },
            },
            icon: "asterisk",
          },
       
        ];
        const inputOptions = [
          
         
          {
            id: "checkbox",
            label: "Checkbox",
            value: {
              value: "checkbox",
              additionalData: {
              action: "add",                
              input : {
                  "label": {
                      "type": "value",
                      "value": " Check box"
                  }
              },
              style:{
                  width: "150px",
              }
              },
            },
            icon: "square-check",
          },
          {
            id: "select",
            label: "Select",
            value: {
              value: "select",
              additionalData: {
              action: "add",    
              style:{
                  width: "200px",
              },
              input : {
                  "options": {
                      "type": "handler",
                      "value": 'return [\\n    {\\n        label : \"Item 1\", \\n        value :\"item 1\"\\n    },\\n    {\\n        label : \"Item 2\", \\n        value :\"item 2\"\\n    }\\n]'

                  },
                  "placeholder": {
                      "type": "value",
                      "value": "Select item"
                  }
              }
              },
            },
            icon: "list-video",
          },
          {
            id: "dropdown",
            label: "Dropdown",
            value: {
              value: "vertical-container-block",
              additionalData: {
              action: "paste",
              schema : JSON.stringify(
                {
                  "version": "1.0",
                  "components": [
                    {
                      "name": "dropdown_9553",
                      "uuid": "cb0376de-7571-4b9f-854b-a24896219390",
                      "input": {
                        "label": {
                          "type": "handler",
                          "value": "return $currentValue"
                        },
                        "options": {
                          "type": "handler",
                          "value": "return [ {label: 'option1', value: 'value1', icon: 'bomb'}, { label: 'option2', value: 'value2', children: [ {label: 'option3', value: 'value3', icon: 'car'}, {label: 'option13', value: 'value13', icon: 'car'}, ], }, ]"
                        },
                        "placeholder": {
                          "type": "string",
                          "value": "Select item"
                        }
                      },
                      "pageId": "35bd7304-b77b-4b54-b222-ee6f2f8bece3",
                      "childrenIds": [
                        "89dbb4d0-a780-4ecf-9f5d-c01afacd2d21",
                        "f7b65c66-8a7a-4443-80d3-ba3035f62929"
                      ],
                      "application_id": "9c144432-215e-4436-b317-96559dcf1e71",
                      "component_type": "dropdown"
                    },
                    {
                      "name": "text_label_423",
                      "component_type": "text_label",
                      "uuid": "f7b65c66-8a7a-4443-80d3-ba3035f62929",
                      "pageId": "35bd7304-b77b-4b54-b222-ee6f2f8bece3",
                      "application_id": "9c144432-215e-4436-b317-96559dcf1e71",
                      "childrenIds": [],
                      "input": {
                        "value": {
                          "type": "string",
                          "value": "Dropdown"
                        }
                      },
                    }
                  ]
                }
              )
              },
            },
            icon: "grip-vertical",
          },
          {
            label: "Menu",
            value: {
              value: "menu",
              additionalData: {
                action: "add",
                style: {
                  "--nuraly-menu-border": "none",
                  width: "200px",
                  "--nuraly-menu-font-size": "12px",
                  "--nuraly-sub-menu-padding-y": "4px",
                  "--nuraly-menu-link-padding-y": "4px",
                  "--nuraly-sub-menu-highlighted-background-color" : "transparent",
                },
               input : {
                options: {
                  type: "array",
                  value: [
                    {
                      "id": "item1",
                      "icon": "folder",
                      "text": "Item 1",
                      "value": "item1"
                    },
                    {
                      "id": "item2",
                      "icon": "folder",
                      "text": "Item 2",
                      "value": "item2",
                      "menu": {}
                    },
                    {
                      "id": "item3",
                      "icon": "folder-open",
                      "text": "Item 3",
                      "value": "item3",
                      "menu": {},
                      "children": [
                        {
                          "id": "item3.1",
                          "icon": "folder",
                          "text": "Item 3.1",
                          "value": "item3.1",
                          "menu": {}
                        },
                        {
                          "id": "item3.2",
                          "icon": "folder",
                          "text": "Item 3.2",
                          "value": "item3.2",
                          "menu": {}
                        },
                        {
                          "id": "item3.3",
                          "icon": "folder-open",
                          "text": "Item 3.3",
                          "value": "item3.3",
                          "menu": {},
                          "children": [
                            {
                              "id": "item3.3.1",
                              "icon": "folder",
                              "text": "Item 3.3.1",
                              "value": "item3.3.1",
                              "menu": {}
                            },
                            {
                              "id": "item3.3.2",
                              "icon": "folder",
                              "text": "Item 3.3.2",
                              "value": "item3.3.2",
                              "menu": {}
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
               }
              },
            },
            icon: "menu",
          },
          {
            label: "File Upload",
            value: {
              value: "file-upload",
              additionalData: {
              action: "add",                
              input : {
                  "label": {
                      "type": "value",
                      "value": " Check box"
                  }
              },
              style:{
                  width: "250px",
              }
              },
            },
            icon: "file-up",
          },
          {
            label: "DatePicker",
            value: {
              value: "Datepicker",
              additionalData: {
              action: "add",
              style:{
                  width: "200px",
              }
              },
            },
            icon: "calendar",
          },
          {
            label: "Icon",
            value: {
              value: "Icon",
              additionalData: {
              action: "add",
              style:{
                  width: "50px",
              }
              },
            },
            icon: "badge",
          },
         
          {
            label: "Text Input",
            value: {
              value: "text_input",
              additionalData: {
              action: "add",
              style:{
                  width: "250px",
              }
              },
            },
            icon: "text-cursor-input",
          },
          {
            label: "Textarea",
            value: {
              value: "Textarea",
              additionalData: {
              action: "add",
              input: {
                "label": {
                  "type": "value",
                  "value": "Textarea"
                },
                "placeholder": {
                  "type": "value",
                  "value": "Enter text..."
                }
              },
              style:{
                  width: "300px",
                  height: "150px",
              }
              },
            },
            icon: "align-left",
          },
          {
            label: "Slider",
            value: {
              value: "Slider",
              additionalData: {
              action: "add",
              input: {
                "value": {
                  "type": "value",
                  "value": 50
                },
                "min": {
                  "type": "value",
                  "value": 0
                },
                "max": {
                  "type": "value",
                  "value": 100
                }
              },
              style:{
                  width: "200px",
              }
              },
            },
            icon: "sliders",
          },
          {
            label: "Button",
            value: {
              value: "button_input",
              additionalData: {
                action: "add",
                style:{
                    width: "120px",
                }
              },
            },
            icon: "mouse",
          },
          {
            label: "Form",
            value: {
              value: "form",
              additionalData: {
                action: "add",
                style:{
                    width: "400px",
                }
              },
            },
            icon: "square-pen",
          },

        ];

        const displayOptions = [
          {
            label: "Text Label",
            value: {
              value: "text_label",
              additionalData: {
              action: "add",
              style:{
                  width: "auto",
              }
              },
            },
            icon: "case-sensitive",
          },

          {
            label: "Rich Text",
            value: {
              value: "rich-text",
              additionalData: {
              action: "add",   
              input : {
                "value": {
                  "type": "string",
                  "value": "<h1>Rich Text</h1>"
                }
              },
              style:{
                  width: "400px",
              }
              },
            },
            icon: "whole-word",
          },
          {
            label: "Badge",
            value: {
              value: "Badge",
              additionalData: {
              action: "add",
              input: {
                "count": {
                  "type": "value",
                  "value": 5
                }
              },
              style:{
                  width: "60px",
              }
              },
            },
            icon: "badge",
          },
          {
            label: "Tag",
            value: {
              value: "Tag",
              additionalData: {
              action: "add",
              input: {
                "label": {
                  "type": "value",
                  "value": "Tag"
                }
              },
              style:{
                  width: "80px",
              }
              },
            },
            icon: "tag",
          },
          {
            label: "Card",
            value: {
              value: "Card",
              additionalData: {
              action: "add",
              input: {
                "title": {
                  "type": "value",
                  "value": "Card Title"
                }
              },
              style: {
                width: "300px",
                height: "200px"
              }
              },
            },
            icon: "credit-card",
          },
          {
            label: "Icon",
            value: {
              value: "Icon",
              additionalData: {
              action: "add",
              style:{
                  width: "50px",
              }
              },
            },
            icon: "badge",
          },
          {
            label: "Code",
            value: {
              value: "code-block",
              additionalData: {
              action: "add",              
              style :{
                width: "100%",
                height: "100px",
              }
              },
            },
            icon: "file-code",
          },
          {
            label: "Embed URL",
            value: {
              value: "embed-url",
              additionalData: {
              action: "add",              
              style :{
                width: "600px",
                height: "400px"
              }
              },
            },
            icon: "file-code",
          },
          {
            label: "Link",
            value: {
              value: "link",
              additionalData: {
              action: "paste",              
              schema: JSON.stringify(
                {
                  "version": "1.0",
                  "components": [
                    {
                      "name": "link",
                      "root": true,
                      "uuid": "b13aa393-45a9-44cb-b9bc-2a3f279ca87a",
                      "style": {},
                      "pageId": "2bea47d0-d1a8-4c02-99fe-6274552f6654",
                      "childrenIds": [
                        "a86c493d-dea0-4608-b7dd-74a2a02fdfa9"
                      ],
                      "application_id": "13186611-5512-4e79-98db-dc7cd88719b6",
                      "component_type": "link"
                    },
                    {
                      "name": "linkt_label",
                      "uuid": "a86c493d-dea0-4608-b7dd-74a2a02fdfa9",
                      "pageId": "2bea47d0-d1a8-4c02-99fe-6274552f6654",
                      "childrenIds": [],
                      "application_id": "13186611-5512-4e79-98db-dc7cd88719b6",
                      "component_type": "text_label"
                    }
                  ]
                }
              )
              },
            },
            icon: "file-code",
          },
        ];
            return [
              {
              id: "input",
              label: "Input",
              options: inputOptions,
              icon: "keyboard"
            },
            {
              id: "display",
              label: "Display",
              options: displayOptions,
              icon: "tv-minimal"
            },
         
          {
            id: "data",
            label: "Data",
            options: dataOptions,
            icon : "database"
          },
          {
            id: "application",
            label: "Application",
            options: applicationOptions,
            icon : "app-window-mac"
          },
          {
            id: "layout",
            label: "Layout",
            options: layoutOptions,
            icon: "columns"
          },
          {
            id: "media",
            label: "Media",
            options: mediaOptions,
            icon: "image"
          }];
            `;