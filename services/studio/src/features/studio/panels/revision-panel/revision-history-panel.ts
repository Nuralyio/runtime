/**
 * Revision History Panel
 *
 * Displays the version history for an application with options to:
 * - Save new versions
 * - Preview any version
 * - Publish any version
 * - Restore to any version
 * - Delete non-published versions
 */

const COMMON_ATTRIBUTES = {
  event: {},
};

// Main revision history container
export const revisionHistoryContainer = {
  uuid: "revision_history_container",
  name: "Revision History Container",
  application_id: "1",
  type: "container",
  ...COMMON_ATTRIBUTES,
  style: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    padding: "16px",
    gap: "16px",
    overflowY: "auto",
  },
  children_ids: [
    "revision_history_header",
    "revision_save_button",
    "revision_list_container"
  ]
};

// Header
export const revisionHistoryHeader = {
  uuid: "revision_history_header",
  name: "Revision History Header",
  application_id: "1",
  type: "container",
  ...COMMON_ATTRIBUTES,
  style: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  children_ids: ["revision_history_title"]
};

export const revisionHistoryTitle = {
  uuid: "revision_history_title",
  name: "Revision History Title",
  application_id: "1",
  type: "text_label",
  ...COMMON_ATTRIBUTES,
  style: {
    fontSize: "16px",
    fontWeight: "600",
    color: "var(--nuraly-text-primary)",
  },
  input: {
    text: {
      type: "string",
      value: "Version History"
    }
  }
};

// Save Version Button
export const revisionSaveButton = {
  uuid: "revision_save_button",
  name: "Save Version Button",
  application_id: "1",
  type: "button_input",
  ...COMMON_ATTRIBUTES,
  style: {
    width: "100%",
  },
  input: {
    text: {
      type: "string",
      value: "Save Version"
    },
    variant: {
      type: "string",
      value: "primary"
    },
    size: {
      type: "string",
      value: "medium"
    },
    icon: {
      type: "string",
      value: "save"
    }
  },
  event: {
    onClick: {
      type: "handler",
      value: /* js */ `
        const applicationId = $currentApplication;
        if (!applicationId) {
          console.error('No application selected');
          return;
        }

        // Show save dialog or directly save
        const description = prompt('Enter a description for this version (optional):');

        // Call API to create revision
        fetch('/api/applications/' + applicationId + '/revisions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...window.__AUTH_HEADERS__
          },
          body: JSON.stringify({ description })
        })
        .then(res => res.json())
        .then(data => {
          console.log('Revision created:', data);
          // Refresh the revision list
          window.dispatchEvent(new CustomEvent('revision-created', { detail: data }));
          alert('Version saved successfully!');
        })
        .catch(err => {
          console.error('Failed to create revision:', err);
          alert('Failed to save version');
        });
      `
    }
  }
};

// Revision List Container
export const revisionListContainer = {
  uuid: "revision_list_container",
  name: "Revision List Container",
  application_id: "1",
  type: "container",
  ...COMMON_ATTRIBUTES,
  style: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    gap: "8px",
  },
  children_ids: ["revision_list"]
};

// Revision List (dynamic)
export const revisionList = {
  uuid: "revision_list",
  name: "Revision List",
  application_id: "1",
  type: "collection",
  ...COMMON_ATTRIBUTES,
  style: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    gap: "8px",
  },
  input: {
    data: {
      type: "handler",
      value: /* js */ `
        $revisions || []
      `
    },
    template: {
      type: "object",
      value: {
        uuid: "revision_item_template",
        type: "container",
        style: {
          display: "flex",
          flexDirection: "column",
          padding: "12px",
          borderRadius: "8px",
          backgroundColor: "var(--nuraly-surface-secondary)",
          border: "1px solid var(--nuraly-border-color)",
          gap: "8px",
        },
        children: [
          {
            uuid: "revision_item_header",
            type: "container",
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            },
            children: [
              {
                uuid: "revision_version_label",
                type: "text_label",
                style: {
                  fontSize: "14px",
                  fontWeight: "600",
                },
                input: {
                  text: {
                    type: "handler",
                    value: "'v' + $item.revision + ($item.isPublished ? ' (Published)' : '')"
                  }
                }
              },
              {
                uuid: "revision_date",
                type: "text_label",
                style: {
                  fontSize: "12px",
                  color: "var(--nuraly-text-secondary)",
                },
                input: {
                  text: {
                    type: "handler",
                    value: "new Date($item.createdAt).toLocaleDateString()"
                  }
                }
              }
            ]
          },
          {
            uuid: "revision_description",
            type: "text_label",
            style: {
              fontSize: "12px",
              color: "var(--nuraly-text-secondary)",
            },
            input: {
              text: {
                type: "handler",
                value: "$item.description || 'No description'"
              }
            }
          },
          {
            uuid: "revision_actions",
            type: "container",
            style: {
              display: "flex",
              gap: "8px",
              marginTop: "8px",
            },
            children: [
              {
                uuid: "revision_preview_btn",
                type: "button_input",
                style: { flex: "1" },
                input: {
                  text: { type: "string", value: "Preview" },
                  variant: { type: "string", value: "secondary" },
                  size: { type: "string", value: "small" }
                },
                event: {
                  onClick: {
                    type: "handler",
                    value: /* js */ `
                      const revision = $item.revision;
                      const applicationId = $currentApplication;
                      window.open('/app/view/' + applicationId + '?revision=' + revision, '_blank');
                    `
                  }
                }
              },
              {
                uuid: "revision_publish_btn",
                type: "button_input",
                style: { flex: "1" },
                input: {
                  text: { type: "string", value: "Publish" },
                  variant: { type: "string", value: "primary" },
                  size: { type: "string", value: "small" },
                  disabled: { type: "handler", value: "$item.isPublished" }
                },
                event: {
                  onClick: {
                    type: "handler",
                    value: /* js */ `
                      const revision = $item.revision;
                      const applicationId = $currentApplication;
                      if (confirm('Are you sure you want to publish version ' + revision + '?')) {
                        fetch('/api/applications/' + applicationId + '/revisions/' + revision + '/publish', {
                          method: 'POST',
                          headers: window.__AUTH_HEADERS__
                        })
                        .then(res => res.json())
                        .then(data => {
                          window.dispatchEvent(new CustomEvent('revision-published', { detail: data }));
                          alert('Version published successfully!');
                        })
                        .catch(err => alert('Failed to publish'));
                      }
                    `
                  }
                }
              },
              {
                uuid: "revision_restore_btn",
                type: "button_input",
                style: { flex: "1" },
                input: {
                  text: { type: "string", value: "Restore" },
                  variant: { type: "string", value: "secondary" },
                  size: { type: "string", value: "small" }
                },
                event: {
                  onClick: {
                    type: "handler",
                    value: /* js */ `
                      const revision = $item.revision;
                      const applicationId = $currentApplication;
                      if (confirm('Are you sure you want to restore to version ' + revision + '? This will create a new version.')) {
                        fetch('/api/applications/' + applicationId + '/revisions/' + revision + '/restore', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            ...window.__AUTH_HEADERS__
                          },
                          body: JSON.stringify({})
                        })
                        .then(res => res.json())
                        .then(data => {
                          window.dispatchEvent(new CustomEvent('revision-restored', { detail: data }));
                          alert('Restored successfully! Page will reload.');
                          window.location.reload();
                        })
                        .catch(err => alert('Failed to restore'));
                      }
                    `
                  }
                }
              }
            ]
          }
        ]
      }
    }
  }
};

export default [
  revisionHistoryContainer,
  revisionHistoryHeader,
  revisionHistoryTitle,
  revisionSaveButton,
  revisionListContainer,
  revisionList
];
