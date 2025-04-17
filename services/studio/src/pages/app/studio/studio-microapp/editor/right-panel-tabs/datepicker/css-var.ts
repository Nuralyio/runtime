export const StudioDatepickerCSSVars = [
    {
      name: "Dark Mode",
      open: true,
      items: [
        {
          name: "General",
          items: [
            { label: "Background Color", cssVar: "--hybrid-datepicker-background-color" },
            { label: "Text Color", cssVar: "--hybrid-datepicker-button-text-color" },
          ],
          open: true
        },
        {
          name: "Hover",
          items: [
            { label: "Day Container Hover Background Color", cssVar: "--hybrid-datepicker-day-container-hover-background-color" },
            { label: "Month Container Hover Background Color", cssVar: "--hybrid-datepicker-month-container-hover-background-color" },
            { label: "Year Container Hover Background Color", cssVar: "--hybrid-datepicker-year-container-hover-background-color" }
          ],
          open: false
        },
        {
          name: "Active",
          items: [
            { label: "Current Day/Month/Year Background Color", cssVar: "--hybrid-datepicker-current-day-month-year-background-color" },
            { label: "Current Day/Month/Year Text Color", cssVar: "--hybrid-datepicker-current-day-month-year-color" }
          ],
          open: false
        },
        {
          name: "Invalid",
          items: [
            { label: "Day Invalid Color", cssVar: "--hybrid-datepicker-day-invalid-color" },
            { label: "Day Invalid Hover Background Color", cssVar: "--hybrid-datepicker-day-invalid-hover-background-color" }
          ],
          open: false
        },
        {
          name: "Today",
          items: [
            { label: "Today Text Color", cssVar: "--hybrid-datepicker-today-color" },
            { label: "Today Underline Color", cssVar: "--hybrid-datepicker-today-underline-color" }
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
            { label: "Background Color", cssVar: "--hybrid-datepicker-background-color" },
            { label: "Text Color", cssVar: "--hybrid-datepicker-button-text-color" },
          ]
        },
        {
          name: "Hover",
          items: [
            { label: "Day Container Hover Background Color", cssVar: "--hybrid-datepicker-day-container-hover-background-color" },
            { label: "Month Container Hover Background Color", cssVar: "--hybrid-datepicker-month-container-hover-background-color" },
            { label: "Year Container Hover Background Color", cssVar: "--hybrid-datepicker-year-container-hover-background-color" }
          ]
        },
        {
          name: "Active",
          items: [
            { label: "Current Day/Month/Year Background Color", cssVar: "--hybrid-datepicker-current-day-month-year-background-color" },
            { label: "Current Day/Month/Year Text Color", cssVar: "--hybrid-datepicker-current-day-month-year-color" }
          ]
        },
        {
          name: "Invalid",
          items: [
            { label: "Day Invalid Color", cssVar: "--hybrid-datepicker-day-invalid-color" },
            { label: "Day Invalid Hover Background Color", cssVar: "--hybrid-datepicker-day-invalid-hover-background-color" }
          ]
        },
        {
          name: "Today",
          items: [
            { label: "Today Text Color", cssVar: "--hybrid-datepicker-today-color" },
            { label: "Today Underline Color", cssVar: "--hybrid-datepicker-today-underline-color" }
          ]
        }
      ]
    }
  ];
  