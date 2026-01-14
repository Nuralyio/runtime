export const workflowAddButton = {
  uuid: "workflow_add_button",
  application_id: "1",
  name: "Add workflow button",
  type: "button_input",
  input: {
    label: {
      type: "string",
      value: ""
    },
    icon: {
      type: "string",
      value: "plus"
    },
    size: {
      type: "string",
      value: "small"
    },
    variant: {
      type: "string",
      value: "ghost"
    }
  },
  event: {
    onClick: /* js */ `
      const appId = GetVar("currentEditingApplication")?.uuid;
      if (!appId) {
        ShowToast({ message: "No application selected", type: "error" });
        return;
      }
      const count = (GetVar("workflows")?.length || 0) + 1;
      createWorkflow(appId, "Workflow " + count).then(wf => {
        if (wf) ShowToast({ message: "Created: " + wf.name, type: "success" });
      });
    `
  },
  style: {
    "--nuraly-button-padding": "4px 8px"
  }
};
