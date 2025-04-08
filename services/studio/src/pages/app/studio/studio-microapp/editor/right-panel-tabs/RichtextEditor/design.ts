import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../helper/common_attributes.ts";
// import { StudioSelectInputs } from "./inputs";

export const StudioRichTextEditorDesign = [
  {
    uuid: "rich_text_editor_blocks",
    application_id: "1",
    name: "Parent Select Container",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "flex-direction": "column",
      "align-items": "center",
      "justify-content": "center"
    },
    childrenIds: [
      "rich_text_editor_collapse_container",
      "typography_collapse_container",
      "size_collapse_container",
      "border_collapse_container"
    ]
  },
  // ...StudioSelectInputs
];