export const workflowListMenu = {
  uuid: "workflow_list_menu",
  application_id: "1",
  name: "Workflow list menu",
  type: "menu",
  input: {
    size: {
      type: "string",
      value: "small"
    },
    arrowPosition: {
      type: "string",
      value: "left"
    },
    options: {
      type: "handler",
      value: /* js */ `
        const appId = GetVar("currentEditingApplication")?.uuid;
        if (!appId) return [{ text: "No app selected", id: "empty", icon: "info", disabled: true }];

        return fetch("/api/v1/workflows?applicationId=" + appId)
          .then(res => res.json())
          .then(wfList => {
            if (!wfList || wfList.length === 0) {
              return [{ text: "No workflows yet", id: "empty", icon: "info", disabled: true }];
            }
            return wfList.map(w => ({
              text: w.name || "Untitled",
              id: w.id,
              icon: "git-branch"
            }));
          });
      `
    }
  },
  event: {
    onSelect: /* js */ `
      if (EventData.id === "empty") return;

      fetch("/api/v1/workflows/" + EventData.id)
        .then(res => res.json())
        .then(workflow => {
          SetVar("currentWorkflow", workflow);
        });
    `
  },
  style: {
    width: "100%",
    flex: "1",
    overflowY: "auto",
    "--nuraly-menu-border": "none",
    "--nuraly-menu-font-size": "13px",
    "margin-left": "13px",
    "margin-top": "11px"
  }
};
