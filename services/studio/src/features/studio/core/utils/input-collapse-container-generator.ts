import { COMMON_ATTRIBUTES } from "../helpers/common_attributes.ts";
import { v4 as uuidv4 } from "uuid"; // Import UUID package


export function generateDynamicContainer(
  mainUuid: string,
  childrenIds: string[],
  collapseUuid: string = uuidv4(),
  collapseLabel: string = "Properties"
) {
  return [
    {
      uuid: mainUuid,
      application_id: "1",
      name: "position collapse container",
      component_type: "vertical-container-block",
      ...COMMON_ATTRIBUTES,
      style: {
        marginTop: "15px"
      },
      childrenIds: [collapseUuid] // Attach the collapse container as the child
    },
    {
      uuid: collapseUuid,
      application_id: "1",
      name: collapseUuid,
      component_type: "Collapse",
      style: {
        marginTop: "16px",
        marginBottom: "16px",
        "--nuraly-spacing-collapse-padding": "0px",
        "--nuraly-spacing-collapse-content-padding": "0px",
        "--nuraly-shadow-collapse-hover": "none",
        "--nuraly-border-radius-collapse": "0",
        "--nuraly-border-radius-collapse-header": "0"
      },
      input: {
        size: {
          type: "string",
          value: "small"
        },
        components: {
          type: "array",
          value: [{
            blockName: `${collapseUuid}_children`,
            label: collapseLabel,
            open: true
          }]
        }
      },
      childrenIds: [`${collapseUuid}_children`]
    },

    {
      uuid: `${collapseUuid}_children`,
      application_id: "1",
      name: "Left panel",
      component_type: "vertical-container-block",
      style: {},
      childrenIds: [...childrenIds] // Pass the dynamic children here
    }
  ];
}

