

export const Insert = /* js */`
        const dataOptions = [
          {
            label: "Table",
            value: {
              value: "Table",
              additionalData: {
                
              },
            },
            icon: "table",
          },

          {
            label: "Collections",
            value: {
              value: "Collection",
              additionalData: {
                
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
                style:{
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
                
              },
            },
            icon: "grip-vertical",
          },
          {
            label: "Ref Component",
            value: {
              value: "RefComponent",
              additionalData: {
                
              },
            },
            icon: "crosshairs",
          },
        ];
        const inputOptions = [
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
            label: "Checkbox",
            value: {
              value: "checkbox",
              additionalData: {
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
            label: "DatePicker",
            value: {
              value: "Datepicker",
              additionalData: {
                
              },
            },
            icon: "calendar",
          },
          {
            label: "Icon",
            value: {
              value: "Icon",
              additionalData: {
                
              },
            },
            icon: "icons",
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
         
        ];
            return [{
              label: "Input",
              children: inputOptions,
              icon: "keyboard"
            },
          {
            label: "Media",
            children: mediaOptions,
            icon: "image"
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