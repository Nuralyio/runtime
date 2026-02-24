export const workflowListPanel = {
  uuid: "workflow_list_panel",
  application_id: "1",
  name: "Workflow list panel",
  type: "container",
  input: {
    direction: {
      type: "string",
      value: "vertical"
    }
  },
  style: {
    width: "292px",
    height: "100%",
    "--nuraly-button-font-size": "12px"
  },
  children_ids: ["workflow_list_menu"]
};
