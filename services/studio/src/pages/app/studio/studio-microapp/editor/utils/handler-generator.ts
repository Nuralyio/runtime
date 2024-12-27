import { v4 as uuidv4 } from "uuid"; // Import UUID package
import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../helper/common_attributes.ts";

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
      applicationId: "1",
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
      applicationId: "1",
      name: "collapse",
      component_type: ComponentType.Collapse,
      style: {
        "--hy-collapse-content-small-size-padding": "5px",
        "--hy-collapse-font-weight": "normal",
        "--hy-collapse-border-radius": "0px",
        "--hy-collapse-width": "292px",
        "--hy-collapse-border": "none",
        "--hy-collapse-border-bottom": "1px solid #636363",
        "--hy-collapse-local-header-background-color": "#3d3d3d"
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
      applicationId: "1",
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
                const selectedComponents = GetVar("selectedComponents") || [];
                const selectedComponent = selectedComponents[0];
                let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                return currentComponent.event ?? {}
                `
        }
      }
    },
    {
      uuid: containerUUID,
      applicationId: "1",
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