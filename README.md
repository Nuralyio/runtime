# @nuraly/runtime

Standalone runtime for executing Nuraly micro-apps in any web environment.

## Usage

```html
    ...
    
    <div id="app"></div>

    <script type="module">
      import "@nuraly/runtime";

      await customElements.whenDefined('micro-app');

      const microApp = document.createElement('micro-app');
      microApp.uuid = "my-app";
      microApp.page_uuid = "page-001";
      microApp.useIsolatedContext = true;
      microApp.appComponents = [...];
      microApp.appPages = [...];
      microApp.mode = "preview";
      microApp.prod = true;

      document.getElementById('app').appendChild(microApp);
    </script>

    ...
```

### MicroApp structure

```javascript
const appComponents = [
  {
    uuid: "comp-001",
    name: "Container",
    component_type: "vertical-container-block",
    application_id: "my-app",
    pageId: "page-001",
    root: true,
    childrenIds: ["comp-002","comp-005"],
    style: { padding: "20px" },
    input: {},
  },
  {
    uuid: "comp-002",
    name: "Button",
    component_type: "button_input",
    application_id: "my-app",
    pageId: "page-001",
    root: false,
    event: {
      onClick: `$count = ($count || 0) + 1;`,
    },
    input: {
      label: { type: "string", value: "Click Me" },
    },
  },
  {
    uuid: "comp-005",
    name: "Counter Display",
    component_type: "text_label",
    application_id: "my-app",
    pageId: "page-001",
    root: false,
    style: {
      fontSize: "14px",
      color: "#888",
      marginTop: "10px",
      fontStyle: "italic",
    },
    parameters: {},
    styleHandlers: {},
    inputHandlers: {},
    input: {
      value: {
        type: "handler",
        value: `
              return "Click the button to see the counter in action" + ($clickCount ? ": " + $clickCount : "");
            `,
      },
    },
  },
];

const appPages = [
  {
    uuid: "page-001",
    application_id: "my-app",
    name: "Home",
    url: "/home",
    is_default: true,
  },
];
```

## License

MIT
