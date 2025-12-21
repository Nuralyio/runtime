import { COMMON_ATTRIBUTES } from "../../core/helpers/common_attributes.ts";

/**
 * Access Control Panel Block
 *
 * This block manages page-level access control settings based on the backend's
 * ResourcePermission model. It handles:
 *
 * 1. Public Access (grantee_type: 'public') - Anyone with the link can view
 * 2. Anonymous Access (grantee_type: 'anonymous') - No authentication required
 * 3. Role-Based Access (grantee_type: 'role') - Specific roles can access
 *
 * The component emits actions that map to ResourcePermission API endpoints:
 * - POST /api/resources/{type}/{id}/permissions - Grant permission
 * - DELETE /api/resources/{type}/{id}/permissions/{permId} - Revoke permission
 *
 * Data Model (ResourcePermission):
 * {
 *   resource_id: string,      // Page UUID
 *   resource_type: 'page',
 *   grantee_type: 'user' | 'role' | 'public' | 'anonymous',
 *   grantee_id: string | null,  // Role ID or User ID (null for public/anonymous)
 *   permission: 'read' | 'write' | 'delete' | 'share',
 *   granted_by: string,       // User who granted permission
 *   expires_at: string | null // Optional expiration
 * }
 */

export default [
  {
    uuid: "access_control_panel_block",
    application_id: "1",
    name: "access control panel block",
    component_type: "Panel",
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
      title: {
        type: "string",
        value: "Access Control"
      },
      mode: {
        type: "string",
        value: "embedded"
      },
      size: {
        type: "string",
        value: "small"
      },
      closable: {
        type: "boolean",
        value: false
      },
      minimizable: {
        type: "boolean",
        value: true
      },
      resizable: {
        type: "boolean",
        value: false
      },
      draggable: {
        type: "boolean",
        value: false
      }
    },
    childrenIds: ["access_control_content_container"]
  },
  {
    uuid: "access_control_content_container",
    application_id: "1",
    name: "access control content container",
    component_type: "vertical-container-block",
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "flex-direction": "column",
      width: "100%",
      padding: "0px",
      gap: "0px"
    },
    input: {
      direction: {
        type: "string",
        value: "vertical"
      }
    },
    childrenIds: ["access_roles_display_block"]
  },
  {
    uuid: "access_roles_display_block",
    name: "access roles display block",
    application_id: "1",
    component_type: "access_roles",
    ...COMMON_ATTRIBUTES,
    style: {
      width: "100%",
      display: "block"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
          const currentPageId = Vars.currentPage;
          if (!currentPageId) return {};

          const currentEditingApplication = GetVar("currentEditingApplication");
          const appPages = GetContextVar(currentEditingApplication?.uuid + ".appPages", currentEditingApplication?.uuid);
          const currentPage = appPages?.find((page) => page.uuid == currentPageId);

          if (!currentPage) return {};

          // Get resource permissions for this page
          // These should be loaded from the ResourcePermission API
          const resourcePermissions = currentPage.resource_permissions || [];

          // Parse permissions into component-friendly format
          const is_public = resourcePermissions.some(rp =>
            rp.grantee_type === 'public' && rp.permission === 'read'
          );

          const is_anonymous = resourcePermissions.some(rp =>
            rp.grantee_type === 'anonymous' && rp.permission === 'read'
          );

          // Get role-based permissions
          const role_permissions = resourcePermissions
            .filter(rp => rp.grantee_type === 'role')
            .map(rp => ({
              role_name: rp.role_name || rp.grantee_id,
              role_id: rp.role_id,
              permission: rp.permission,
              is_system: rp.is_system || false,
              permission_id: rp.id
            }));

          // Get available roles from application
          // These should come from the ApplicationRole API
          const available_roles = currentEditingApplication?.roles || [];

          return {
            is_public,
            is_anonymous,
            role_permissions,
            available_roles,
            page_id: currentPageId,
            application_id: currentEditingApplication?.uuid
          };
        `
      }
    },
    event: {
      onChange: /* js */`
        const currentPageId = Vars.currentPage;
        if (!currentPageId) return;

        const currentEditingApplication = GetVar("currentEditingApplication");
        const appPages = GetContextVar(currentEditingApplication?.uuid + ".appPages", currentEditingApplication?.uuid);
        const currentPage = appPages?.find((page) => page.uuid == currentPageId);

        if (!currentPage) return;

        const action = EventData.action;
        const appId = currentEditingApplication?.uuid;

        // Handle different actions by updating resource permissions
        switch (action) {
          case 'toggle_public': {
            const is_public = EventData.is_public;
            const existingPermissions = currentPage.resource_permissions || [];

            let newPermissions;
            if (is_public) {
              // Add public read permission
              const hasPublic = existingPermissions.some(rp => rp.grantee_type === 'public');
              if (!hasPublic) {
                newPermissions = [...existingPermissions, {
                  resource_id: currentPageId,
                  resource_type: 'page',
                  grantee_type: 'public',
                  grantee_id: null,
                  permission: 'read'
                }];
              } else {
                newPermissions = existingPermissions;
              }
            } else {
              // Remove public permission
              newPermissions = existingPermissions.filter(rp => rp.grantee_type !== 'public');
            }

            const updatedPage = {
              ...currentPage,
              resource_permissions: newPermissions
            };

            UpdatePage(updatedPage, appId).catch((e) => {
              console.error('Error updating page public access:', e);
            });
            break;
          }

          case 'toggle_anonymous': {
            const is_anonymous = EventData.is_anonymous;
            const existingPermissions = currentPage.resource_permissions || [];

            let newPermissions;
            if (is_anonymous) {
              // Add anonymous read permission (also implies public)
              const hasAnonymous = existingPermissions.some(rp => rp.grantee_type === 'anonymous');
              if (!hasAnonymous) {
                // Remove public if exists (anonymous is more permissive)
                newPermissions = existingPermissions.filter(rp => rp.grantee_type !== 'public');
                newPermissions.push({
                  resource_id: currentPageId,
                  resource_type: 'page',
                  grantee_type: 'anonymous',
                  grantee_id: null,
                  permission: 'read'
                });
              } else {
                newPermissions = existingPermissions;
              }
            } else {
              // Remove anonymous permission
              newPermissions = existingPermissions.filter(rp => rp.grantee_type !== 'anonymous');
            }

            const updatedPage = {
              ...currentPage,
              resource_permissions: newPermissions
            };

            UpdatePage(updatedPage, appId).catch((e) => {
              console.error('Error updating page anonymous access:', e);
            });
            break;
          }

          case 'add_role_permission': {
            const roleName = EventData.role_name;
            const roleId = EventData.role_id;
            const permission = EventData.permission;
            const isSystem = EventData.is_system;
            const existingPermissions = currentPage.resource_permissions || [];

            // Check if role permission already exists
            const hasRole = existingPermissions.some(rp =>
              rp.grantee_type === 'role' && rp.role_name === roleName
            );

            if (!hasRole) {
              const newPermissions = [...existingPermissions, {
                resource_id: currentPageId,
                resource_type: 'page',
                grantee_type: 'role',
                grantee_id: roleId || roleName,
                role_name: roleName,
                role_id: roleId,
                permission: permission,
                is_system: isSystem
              }];

              const updatedPage = {
                ...currentPage,
                resource_permissions: newPermissions
              };

              UpdatePage(updatedPage, appId).catch((e) => {
                console.error('Error adding role permission:', e);
              });
            }
            break;
          }

          case 'update_role_permission': {
            const roleName = EventData.role_name;
            const permission = EventData.permission;
            const existingPermissions = currentPage.resource_permissions || [];

            const newPermissions = existingPermissions.map(rp => {
              if (rp.grantee_type === 'role' && rp.role_name === roleName) {
                return { ...rp, permission };
              }
              return rp;
            });

            const updatedPage = {
              ...currentPage,
              resource_permissions: newPermissions
            };

            UpdatePage(updatedPage, appId).catch((e) => {
              console.error('Error updating role permission:', e);
            });
            break;
          }

          case 'remove_role_permission': {
            const roleName = EventData.role_name;
            const existingPermissions = currentPage.resource_permissions || [];

            const newPermissions = existingPermissions.filter(rp =>
              !(rp.grantee_type === 'role' && rp.role_name === roleName)
            );

            const updatedPage = {
              ...currentPage,
              resource_permissions: newPermissions
            };

            UpdatePage(updatedPage, appId).catch((e) => {
              console.error('Error removing role permission:', e);
            });
            break;
          }

          default:
            console.warn('Unknown access control action:', action);
        }
      `
    }
  }
];
