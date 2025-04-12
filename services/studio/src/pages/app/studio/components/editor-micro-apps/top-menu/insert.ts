

export const Insert = /* js */`
        const dataOptions = [
          {
            label: "Table",
            value: {
              value: "Table",
              additionalData: {
              action: "add",                
              },
            },
            icon: "table",
          },

          {
            label: "Collections",
            value: {
              value: "Collection",
              additionalData: {
              action: "add",                
              },
            },
            icon: "layer-group",
          },
        ];
        const mediaOptions = [
          {
            label: "Image",
            value: {
              value: "Image",
              additionalData: {
              action: "add",                style:{
                  width: "100px",
                  height: "100px",
                }
              },
            },
            icon: "image",
          },
        ]

        const applicationOptions = [
           
          {
            label: "MicroApp",
            value: {
              value: "MicroApp",
              additionalData: {
              action: "add",               
              },
            },
            icon: "cube",
          },
        ];

        const layoutOptions = [
          {
            label: "Container",
            value: {
              value: "vertical-container-block",
              additionalData: {
              action: "add",
                
              },
            },
            icon: "grip-vertical",
          },
         
          {
            label: "Ref Component",
            value: {
              value: "RefComponent",
              additionalData: {
              action: "add",                
              },
            },
            icon: "crosshairs",
          },
       
        ];
        const inputOptions = [
          
         
          {
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
              }
              },
            },
            icon: "square-check",
          },
          {
            label: "Select",
            value: {
              value: "select",
              additionalData: {
              action: "add",                
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
            icon: "th-list",
          },
          {
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
                          "value": "return Vars.currentValue"
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
                  "--hybrid-menu-border": "none",
                  width: "100%",
                  "--hybrid-menu-font-size": "12px",
                  "--hybrid-sub-menu-padding-y": "4px",
                  "--hybrid-menu-link-padding-y": "4px",
                  "--hybrid-sub-menu-highlighted-background-color" : "transparent",
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
            icon: "list-ul",
          },
          {
            label: "DatePicker",
            value: {
              value: "Datepicker",
              additionalData: {
              action: "add",                
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
              },
            },
            icon: "icons",
          },
         
          {
            label: "Text Input",
            value: {
              value: "text_input",
              additionalData: {
              action: "add",                
              },
            },
            icon: "pen-to-square",
          },
          {
            label: "Button",
            value: {
              value: "button_input",
              additionalData: {
                action: "add",
              },
            },
            icon: "mouse",
          },
         
        ];

        const displayOptions = [
          {
            label: "Text Label",
            value: {
              value: "text_label",
              additionalData: {
              action: "add",                
              },
            },
            icon: "i-cursor",
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
              }             
              },
            },
            icon: "i-cursor",
          },
       
          {
            label: "Icon",
            value: {
              value: "Icon",
              additionalData: {
              action: "add",                
              },
            },
            icon: "icons",
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
                height: "300px"
              }
              },
            },
            icon: "file-code",
          },
          {
            label: "Media",
            children: mediaOptions,
            icon: "image"
          },
        ];
            return [
              {
              label: "Input",
              children: inputOptions,
              icon: "keyboard"
            },
            {
              label: "Display",
              children: displayOptions,
              icon: "chalkboard"
            },
         
          {
            label: "Data",
            children: dataOptions,
            icon : "database"
          },
          {
            label: "Application",
            children: applicationOptions,
            icon : "cube"
          },
          {
            label: "Layout",
            children: layoutOptions,
            icon: "columns"
          }];
            `;