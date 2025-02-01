import { generateComponents } from "../../../common-blocks/studio-theme-block";
const cssVariables = [
    {
      name: "Dark Mode",
      open: true,
      items: [
        { label: "Background Color", cssVar: "--container-dark-bg-color" },
      ]
    },
    {
      name: "Light Mode",
      open: true,
      items: [
        { label: "Background Color", cssVar: "--container-bg-color" },
      ]
    }
  ];
export const StudioContainerTheme = generateComponents(cssVariables, "studio_container_theme_container");
