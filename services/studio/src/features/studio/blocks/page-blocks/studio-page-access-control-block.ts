import { COMMON_ATTRIBUTES } from "../../core/helpers/common_attributes.ts";

/**
 * Access Control Panel Block
 *
 * UI-only component for managing resource permissions.
 * Works with any resource type (page, component, application).
 * Backend handles permission logic with inheritance.
 *
 * Events emitted:
 * - toggle_public: { is_public, grantee_type: 'public', permission }
 * - toggle_anonymous: { is_anonymous, grantee_type: 'anonymous', permission }
 * - add_role_permission: { grantee_type: 'role', role_name, role_id, permission, is_system }
 * - update_role_permission: { role_name, permission }
 * - remove_role_permission: { role_name }
 */

export default [
  {
    uuid: "access_control_panel_block",
    application_id: "1",
    name: "access control panel block",
    type: "panel",
    ...COMMON_ATTRIBUTES,
    style: {
      width: "100%",
      height: "auto",
      display: "flex",
      "flex-direction": "column",
      "background-color": "var(--nuraly-color-background)",
      "border-radius": "var(--nuraly-border-radius-medium)",
      "--nuraly-border-radius-small": "0px",
      "--nuraly-label-font-weight": "350",
      "--nuraly-panel-header-background": "#fcfcfc",
      "--nuraly-panel-body-padding-small": "0px",
      "padding": "0px",
      "--nuraly-panel-shadow": "none"
    },
    input: {
      title: { type: "string", value: "Access Control" },
      mode: { type: "string", value: "embedded" },
      size: { type: "string", value: "small" },
      closable: { type: "boolean", value: false },
      minimizable: { type: "boolean", value: true },
      resizable: { type: "boolean", value: false },
      draggable: { type: "boolean", value: false }
    },
    children_ids: ["access_control_content_container"]
  },
  {
    uuid: "access_control_content_container",
    application_id: "1",
    name: "access control content container",
    type: "container",
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "flex-direction": "column",
      width: "100%",
      padding: "0px",
      gap: "0px"
    },
    input: {
      direction: { type: "string", value: "vertical" }
    },
    children_ids: ["access_roles_display_block"]
  },
  {
    uuid: "access_roles_display_block",
    name: "access roles display block",
    application_id: "1",
    type: "access_roles",
    ...COMMON_ATTRIBUTES,
    style: {
      width: "100%",
      display: "block"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
          // Get current resource context (page, component, or application)
          const currentPageId = $currentPage;
          const currentEditingApplication = GetVar("currentEditingApplication");

          // Determine resource type and id
          let resourceType = 'page';
          let resourceId = currentPageId;


          // Return current permission state
          // This data should come from API response stored in context
          const permissionsKey = resourceType + '_' + resourceId + '_permissions';
          const permissions = GetVar(permissionsKey) || {};

          return {
            resource_type: resourceType,
            resource_id: resourceId,
            application_id: currentEditingApplication?.uuid,
            is_public: permissions.is_public || false,
            is_anonymous: permissions.is_anonymous || false,
            role_permissions: permissions.role_permissions || [],
            available_roles: currentEditingApplication?.roles || []
          };
        `
      }
    },
    event: {
      onInit: /* js */`
        (async () => {
          const currentPageId = $currentPage;
          const resourceType = 'page';
          const resourceId = currentPageId;
 return;
          if (!resourceId) {
            return;
          }

          const baseUrl = '/api/resources/' + resourceType + '/' + resourceId;

          try {
            const response = await fetch(baseUrl + '/permissions', {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
              console.error('Failed to load permissions:', response.status);
              return;
            }

            const permissions = await response.json();
            if (permissions && Array.isArray(permissions)) {
              const permissionsKey = resourceType + '_' + resourceId + '_permissions';
              SetVar(permissionsKey, {
                is_public: permissions.some(function(p) { return p.granteeType === 'public'; }),
                is_anonymous: permissions.some(function(p) { return p.granteeType === 'anonymous'; }),
                role_permissions: permissions
                  .filter(function(p) { return p.granteeType === 'role'; })
                  .map(function(p) {
                    return {
                      role_name: p.granteeId,
                      permission: p.permission,
                      is_system: ['owner', 'admin', 'editor', 'viewer'].indexOf(p.granteeId) !== -1
                    };
                  })
              });
            }
          } catch (error) {
            console.error('Error loading permissions:', error);
          }
        })();
      `,
      onChange: /* js */`
        (async () => {
          const eventData = EventData.detail || EventData;
          const action = eventData.action;

          // Skip if no valid action (e.g., initial render)
          if (!action) {
            return;
          }

          const currentPageId = $currentPage;
          const resourceType = 'page';
          const resourceId = currentPageId;
          const baseUrl = '/api/resources/' + resourceType + '/' + resourceId;

          const makeRequest = async (method, endpoint, body) => {
            const options = {
              method: method,
              headers: { 'Content-Type': 'application/json' }
            };
            if (body) {
              options.body = JSON.stringify(body);
            }
            try {
              const response = await fetch(endpoint, options);
              if (!response.ok) {
                throw new Error('Request failed');
              }
              return await response.json();
            } catch (error) {
              console.error('Access control error:', error);
              ShowErrorToast('Failed to update access control');
              return null;
            }
          };

          // Handle different actions from the UI
          if (action === 'toggle_anonymous') {
            if (eventData.is_anonymous) {
              await makeRequest('POST', baseUrl + '/make-anonymous', { permission: eventData.permission || 'read' });
            } else {
              await makeRequest('DELETE', baseUrl + '/make-anonymous', null);
            }
          } else if (action === 'toggle_public') {
            if (eventData.is_public) {
              await makeRequest('POST', baseUrl + '/make-public', { permission: eventData.permission || 'read' });
            } else {
              await makeRequest('DELETE', baseUrl + '/make-public', null);
            }
          } else if (action === 'add_role_permission') {
            await makeRequest('POST', baseUrl + '/role-permission', {
              roleName: eventData.role_name,
              permission: eventData.permission || 'read'
            });
          } else if (action === 'update_role_permission') {
            await makeRequest('DELETE', baseUrl + '/role-permission/' + encodeURIComponent(eventData.role_name), null);
            await makeRequest('POST', baseUrl + '/role-permission', {
              roleName: eventData.role_name,
              permission: eventData.permission
            });
          } else if (action === 'remove_role_permission') {
            await makeRequest('DELETE', baseUrl + '/role-permission/' + encodeURIComponent(eventData.role_name), null);
          } else {
            return;
          }

          // Refresh permissions state after a successful action
          const permissions = await makeRequest('GET', baseUrl + '/permissions', null);
          if (permissions && Array.isArray(permissions)) {
            const permissionsKey = resourceType + '_' + resourceId + '_permissions';
            SetVar(permissionsKey, {
              is_public: permissions.some(function(p) { return p.granteeType === 'public'; }),
              is_anonymous: permissions.some(function(p) { return p.granteeType === 'anonymous'; }),
              role_permissions: permissions
                .filter(function(p) { return p.granteeType === 'role'; })
                .map(function(p) {
                  return {
                    role_name: p.granteeId,
                    permission: p.permission,
                    is_system: ['owner', 'admin', 'editor', 'viewer'].indexOf(p.granteeId) !== -1
                  };
                })
            });
          }
        })();
      `
    }
  }
];
