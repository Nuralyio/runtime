export const Application = /* js */`
  return [
    {
      id: "properties",
      label: "Properties",
      value: {
        value: "properties",
        action: "open-modal"
      },
      icon: "settings",
    },
    {
      id: "kv-storage",
      label: "KV Storage",
      value: {
        value: "kv-storage",
        action: "open-kv-modal"
      },
      icon: "database",
    },
    {
      id: "export",
      label: "Export App",
      value: {
        value: "export",
        action: "export"
      },
      icon: "download",
    },
    {
      id: "import",
      label: "Import App",
      value: {
        value: "import",
        action: "import"
      },
      icon: "upload",
    }
  ];
`;
