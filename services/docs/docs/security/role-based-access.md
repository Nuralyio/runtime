---
sidebar_position: 4
---

# Role-Based Access Control

Nuraly implements a hierarchical role-based access control (RBAC) system for managing user permissions within applications.

## System Roles

The following system roles are available by default:

| Role | Hierarchy | Description | Permissions |
|------|-----------|-------------|-------------|
| `owner` | 100 | Full control | `*` (all permissions) |
| `admin` | 80 | Manage members, edit settings | `application:read`, `application:write`, `page:*`, `component:*`, `member:*` |
| `editor` | 60 | Create/edit pages & components | `application:read`, `page:*`, `component:*`, `member:read` |
| `viewer` | 40 | Read-only access | `application:read`, `page:read`, `component:read`, `member:read` |

## Role Hierarchy

Higher hierarchy values indicate more privileged roles:

```
owner (100)
   │
   ▼
admin (80)
   │
   ▼
editor (60)
   │
   ▼
viewer (40)
   │
   ▼
(no role / anonymous)
```

A user with a higher-level role automatically has all permissions of lower-level roles.

## Permission Format

Permissions follow the format: `{resource}:{action}`

### Resources
- `application` - Application-level operations
- `page` - Page operations
- `component` - Component operations
- `member` - Team member management

### Actions
- `read` - View the resource
- `write` - Modify the resource
- `delete` - Remove the resource
- `share` - Grant access to others
- `*` - All actions

### Examples
- `page:read` - Can view pages
- `page:*` - Can perform all page operations
- `*` - Full access to everything

## Custom Roles

You can create custom roles for specific use cases:

### Create Custom Role

```bash
curl -X POST "http://localhost/api/applications/{appId}/roles" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "content-reviewer",
    "display_name": "Content Reviewer",
    "description": "Can review and approve content",
    "permissions": ["page:read", "component:read"],
    "hierarchy": 50
  }'
```

### Assign Role to User

```bash
curl -X POST "http://localhost/api/applications/{appId}/members" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid",
    "role": "content-reviewer"
  }'
```

## Resource-Level Role Permissions

Grant role-based access to specific resources:

### Grant Role Access to Page

```bash
curl -X POST "http://localhost/api/resources/page/{pageId}/role-permission" \
  -H "Content-Type: application/json" \
  -d '{
    "roleName": "editor",
    "permission": "write"
  }'
```

### Revoke Role Access

```bash
curl -X DELETE "http://localhost/api/resources/page/{pageId}/role-permission/editor"
```

## Permission Checking

### API Level

The `AuthorizationService` provides a unified `canAccess()` method for all permission checks:

```typescript
// Check application-level permission
const canEdit = await authorizationService.canAccess(
  user,
  applicationId,
  'application',
  'page:write'
);

// Check page-level access
const canReadPage = await authorizationService.canAccess(
  user,
  pageId,
  'page',
  'read',
  applicationId // optional, for role-based permission lookup
);

// Check component-level access
const canEditComponent = await authorizationService.canAccess(
  user,
  componentId,
  'component',
  'write',
  applicationId
);
```

Applications are treated as resources - there's no separate method for app permissions.

### Permission Resolution Order

1. **Direct User Permission** - Check if user has explicit permission on resource
2. **Role Permission** - Check if user's role grants permission on resource
3. **Application Role** - Check user's role in the application
4. **Public/Anonymous** - Check if resource allows public access

## UI Configuration

### Access Control Panel

The studio provides an Access Control panel for managing permissions:

1. **Public Access Section**
   - Toggle anonymous access
   - Toggle public with link access

2. **Role-Based Access Section**
   - View assigned roles
   - Add/remove role permissions
   - Set permission level per role

3. **Add Role Permission**
   - Select from system roles (Owner, Admin, Editor, Viewer)
   - Add custom role by name
   - Choose permission level (View, Edit, Delete, Share)

## Examples

### Restrict Page to Editors Only

```bash
# Remove any anonymous/public access
curl -X DELETE "http://localhost/api/resources/page/{pageId}/make-anonymous"
curl -X DELETE "http://localhost/api/resources/page/{pageId}/make-public"

# Grant editor role access
curl -X POST "http://localhost/api/resources/page/{pageId}/role-permission" \
  -H "Content-Type: application/json" \
  -d '{"roleName": "editor", "permission": "read"}'
```

### Create Read-Only Dashboard for Viewers

```bash
# Grant viewer role read access
curl -X POST "http://localhost/api/resources/page/{pageId}/role-permission" \
  -H "Content-Type: application/json" \
  -d '{"roleName": "viewer", "permission": "read"}'

# Grant editor role write access
curl -X POST "http://localhost/api/resources/page/{pageId}/role-permission" \
  -H "Content-Type: application/json" \
  -d '{"roleName": "editor", "permission": "write"}'
```

### Grant Temporary Access

```bash
# Share with user for 30 days
curl -X POST "http://localhost/api/resources/page/{pageId}/share" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid",
    "permission": "read",
    "expiresAt": "2024-02-01T00:00:00Z"
  }'
```

## Best Practices

1. **Use System Roles When Possible** - Leverage the built-in role hierarchy
2. **Principle of Least Privilege** - Grant minimum required permissions
3. **Regular Audits** - Review role assignments periodically
4. **Document Custom Roles** - Maintain documentation for custom roles
5. **Test Permission Changes** - Verify access after modifying permissions
