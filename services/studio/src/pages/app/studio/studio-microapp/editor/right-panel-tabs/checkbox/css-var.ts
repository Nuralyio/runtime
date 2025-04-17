export const StudioCheckboxCSSVar =  [
  {
    name: "Dark Mode",
    open: true,
    items: [
      {
        name: "General",
        items: [
          { label: "Checkbox Text Color", cssVar: "--hybrid-checkbox-color" },
          { label: "Checkbox Symbol Color", cssVar: "--hybrid-checkbox-symbol-color" }
        ],
        open: true
      },
      {
        name: "Empty State",
        items: [
          { label: "Empty Background Color", cssVar: "--hybrid-checkbox-empty-background-color" }
        ],
        open: false
      },
      {
        name: "Filled State",
        items: [
          { label: "Filled Background Color", cssVar: "--hybrid-checkbox-filled-background-color" }
        ],
        open: false
      },
      {
        name: "Disabled State",
        items: [
          { label: "Disabled Text Color", cssVar: "--hybrid-checkbox-disabled-text-color" },
          { label: "Disabled Background Color", cssVar: "--hybrid-checkbox-disabled-background-color" }
        ],
        open: false
      }
    ]
  },
  {
    name: "Light Mode",
    items: [
      {
        name: "General",
        items: [
          { label: "Checkbox Text Color", cssVar: "--hybrid-checkbox-color" },
          { label: "Checkbox Symbol Color", cssVar: "--hybrid-checkbox-symbol-color" }
        ]
      },
      {
        name: "Empty State",
        items: [
          { label: "Empty Background Color", cssVar: "--hybrid-checkbox-empty-background-color" }
        ]
      },
      {
        name: "Filled State",
        items: [
          { label: "Filled Background Color", cssVar: "--hybrid-checkbox-filled-background-color" }
        ]
      },
      {
        name: "Disabled State",
        items: [
          { label: "Disabled Text Color", cssVar: "--hybrid-checkbox-disabled-text-color" },
          { label: "Disabled Background Color", cssVar: "--hybrid-checkbox-disabled-background-color" }
        ]
      }
    ]
  }
];
