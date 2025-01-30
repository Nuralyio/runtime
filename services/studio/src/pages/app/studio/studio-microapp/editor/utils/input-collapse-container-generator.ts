import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../helper/common_attributes.ts";
import { CollapseContainerTheme, CollapseHeaderTheme } from "./common-editor-theme.ts";
import { v4 as uuidv4 } from "uuid"; // Import UUID package


export function generateDynamicContainer(
  mainUuid: string,
  childrenIds: string[],
  collapseUuid: string = uuidv4()
) {
  return [
    {
      uuid: mainUuid,
      applicationId: "1",
      name: "position collapse container",
      component_type: ComponentType.Container,
      ...COMMON_ATTRIBUTES,
      style: {
        marginTop: "15px"
      },
      childrenIds: [collapseUuid] // Attach the collapse container as the child
    },
    {
      uuid: collapseUuid,
      applicationId: "1",
      name: collapseUuid,
      component_type: ComponentType.Container,
      style: {
      },
      childrenIds: [
        "input_text_label_collapse",
        `${collapseUuid}_children`
      ]
    },
  
    {
      uuid: `${collapseUuid}_children`,
      applicationId: "1",
      name: "Left panel",
      component_type: ComponentType.Container,
      style: {},
      childrenIds: [...childrenIds] // Pass the dynamic children here
    }
  ];
}

