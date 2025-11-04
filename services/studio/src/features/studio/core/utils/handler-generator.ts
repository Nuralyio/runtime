import { v4 as uuidv4 } from "uuid"; // Import UUID package
import { ComponentType } from "@shared/redux/store/component/component.interface.ts";
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
      component_type: ComponentType.Container,
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
      component_type: ComponentType.Collapse,
      style: {
        "--nr-collapse-content-small-size-padding": "5px",
        "--nr-collapse-font-weight": "normal",
        "--nr-collapse-border-radius": "0px",
        "--nr-collapse-width": "280px",
        "--nr-collapse-border": "none",
        "--nr-collapse-border-bottom": "1px solid #636363",
        "--nr-collapse-local-header-background-color": "#3d3d3d"
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
      component_type: ComponentType.Handlers,
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
      component_type: ComponentType.Container,
      ...COMMON_ATTRIBUTES,
      style: {
        display: "flex",
        "flex-direction": "column"
      },
      childrenIds: [`${collapseContainerUUID}`]
    }
  ];
};