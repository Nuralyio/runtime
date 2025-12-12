import { v4 as uuidv4 } from "uuid"; // Import UUID package
import { COMMON_ATTRIBUTES } from "../helpers/common_attributes.ts";

export const createHandlersFromEvents = (
  events: Array<{ name: string; label: string }>,
  containerUUID: string
) => {
  const handlerUUID = uuidv4();
  const collapseContainerUUID = uuidv4();
  const collapseUUID = uuidv4();
  return [
    {
      uuid: collapseContainerUUID,
      application_id: "1",
      name: "position collapse container",
      component_type: "vertical-container-block",
      ...COMMON_ATTRIBUTES,
      style: {
        marginTop: "13px"
      },
      childrenIds: [collapseUUID]
    },
    {
      uuid: collapseUUID,
      application_id: "1",
      name: "collapse",
      component_type: "Collapse",
      style: {
        "--nuraly-spacing-collapse-padding": "0px",
        "--nuraly-spacing-collapse-content-padding": "6px",
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
          value: [{ blockName: handlerUUID, label: "Triggers", open: true }]
        }
      }
    },
    {
      uuid: handlerUUID,
      application_id: "1",
      name: "Dynamic Event Handler Container",
      component_type: "Handlers",
      input: {
        allowedEvents: {
          type: "array",
          value: events
        },
        events: {
          type: "handler",
          value: /* js */ `
          const selectedComponent = Utils.first(Vars.selectedComponents);
                return selectedComponent.event ?? {}
                `
        }
      }
    },
    {
      uuid: containerUUID,
      application_id: "1",
      name: "Dynamic Event Handler Container",
      component_type: "vertical-container-block",
      ...COMMON_ATTRIBUTES,
      style: {
        display: "flex",
        "flex-direction": "column"
      },
      childrenIds: [`${collapseContainerUUID}`]
    }
  ];
};