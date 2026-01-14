export const workflowListHeader = {
  uuid: "workflow_list_header",
  application_id: "1",
  name: "Workflow list header",
  type: "container",
  input: {
    direction: {
      type: "string",
      value: "horizontal"
    }
  },
  style: {
    width: "100%",
    padding: "8px 12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #e5e7eb"
  },
  children_ids: ["workflow_list_title", "workflow_add_button"]
};

export const workflowListTitle = {
  uuid: "workflow_list_title",
  application_id: "1",
  name: "Workflow list title",
  type: "text_label",
  input: {
    value: {
      type: "string",
      value: "Workflows"
    }
  },
  style: {
    fontWeight: "600",
    fontSize: "13px",
    color: "#374151"
  }
};
