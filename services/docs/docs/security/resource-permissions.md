---
sidebar_position: 2
---

# Resource Permissions

Resource permissions provide fine-grained access control for applications, pages, and components. Each resource can have multiple permissions granted to different grantees.

## Database Schema

Permissions are stored in the `resource_permissions` table:

```sql
CREATE TABLE resource_permissions (
  id SERIAL PRIMARY KEY,
  resource_id TEXT NOT NULL,           -- UUID of the resource
  resource_type TEXT NOT NULL,         -- 'application', 'page', 'component'
  grantee_type TEXT NOT NULL,          -- 'user', 'role', 'public', 'anonymous'
  grantee_id TEXT,                     -- User UUID or role name (null for public/anonymous)
  permission TEXT NOT NULL,            -- 'read', 'write', 'delete', 'share'
  granted_by TEXT NOT NULL,            -- UUID of user who granted permission
  expires_at TIMESTAMP,                -- Optional expiration
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Permission Hierarchy

Resources inherit permissions from their parent:

```
Application
    │
    ├── Page 1 (can inherit from Application)
    │       │
    │       └── Component A
    │
    └── Page 2 (can override Application settings)
            │
            └── Component B
```

### Inheritance Rules

1. **Applications** - Top-level, no inheritance
2. **Pages** - Can inherit anonymous access from application OR be restricted independently
3. **Components** - Inherit from parent application

:::important Page-Level Restrictions
Pages **do not** automatically inherit anonymous access from their parent application. Each page must explicitly enable anonymous access, or it will require authentication.
:::

## API Endpoints

### Get Resource Permissions

```http
GET /api/resources/{resourceType}/{resourceId}/permissions
```

Returns all permissions for a resource.

**Response:**
```json
[
  {
    "id": 1,
    "resourceId": "abc-123",
    "resourceType": "page",
    "granteeType": "anonymous",
    "granteeId": null,
    "permission": "read",
    "grantedBy": "user-uuid",
    "expiresAt": null,
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

### Grant Permission

```http
POST /api/resources/{resourceType}/{resourceId}/permissions
```

**Request Body:**
```json
{
  "granteeType": "user",
  "granteeId": "user-uuid",
  "permission": "read",
  "expiresAt": "2024-12-31T23:59:59Z"
}
```

### Revoke Permission

```http
DELETE /api/resources/{resourceType}/{resourceId}/permissions/{permissionId}
```

### Check Anonymous Access

```http
GET /api/resources/{resourceType}/{resourceId}/check-anonymous
```

Used by the gateway to determine if a resource allows anonymous access.

**Response:**
```json
{
  "allowed": false,
  "restricted": true,
  "permission": null
}
```

| Field | Description |
|-------|-------------|
| `allowed` | `true` if anonymous access is explicitly granted |
| `restricted` | `true` if the resource blocks inheritance (pages only) |
| `permission` | Permission level if allowed (e.g., "read") |

## Permission Checks

### Gateway Level

The gateway intercepts requests and checks permissions before forwarding to the API:

```lua
-- Simplified flow
function authenticateWithOptionalAnonymous(resourceType, resourceId, applicationId)
    -- 1. Try Keycloak authentication
    if userIsLoggedIn then
        setUserHeader(userToken)
        return
    end

    -- 2. Check resource-level anonymous access
    local accessCheck = checkAnonymousAccess(resourceType, resourceId)
    if accessCheck.allowed then
        setAnonymousUserHeader()
        return
    end

    -- 3. If restricted, redirect to login
    if accessCheck.restricted then
        redirectToKeycloak()
        return
    end

    -- 4. Check application inheritance
    if applicationHasAnonymousAccess then
        setAnonymousUserHeader()
        return
    end

    -- 5. Default: require login
    redirectToKeycloak()
end
```

### API Level

The API validates permissions using the unified `AuthorizationService.canAccess()` method:

```typescript
// Check if user can access an application
const canReadApp = await authorizationService.canAccess(
  user,
  applicationId,
  'application',
  'read'
);

// Check if user can access a page
const canReadPage = await authorizationService.canAccess(
  user,
  pageId,
  'page',
  'read',
  applicationId  // optional: for role-based permission lookup
);

// Check if user can write to a component
const canWriteComponent = await authorizationService.canAccess(
  user,
  componentId,
  'component',
  'write',
  applicationId
);
```

All resources (applications, pages, components) use the same `canAccess()` method. When checking application permissions, pass `'application'` as the `resourceType` - the `resourceId` is automatically used as the application context for role-based lookups.

## Authorization Service API

The `AuthorizationService` provides a unified interface for all permission checks:

### `canAccess(user, resourceId, resourceType, permission, applicationId?)`

Check if a user can access a specific resource.

| Parameter | Type | Description |
|-----------|------|-------------|
| `user` | `IUser` | User object with `uuid`, `anonymous`, and optional `roles` |
| `resourceId` | `string` | UUID of the resource |
| `resourceType` | `string` | `'application'`, `'page'`, or `'component'` |
| `permission` | `string` | `'read'`, `'write'`, `'delete'`, `'share'`, or prefixed like `'page:read'` |
| `applicationId` | `string?` | Optional app context for role-based lookups (auto-set for applications) |

**Permission Check Order:**
1. Direct resource permissions (user, public, anonymous)
2. Application membership role permissions
3. Deny if none match

### `requirePermission(user, resourceId, resourceType, permission, applicationId?)`

Same as `canAccess()` but throws an error if access is denied.

### `getAccessibleResources(user, resourceType, permission)`

Returns all resource IDs the user can access with the given permission.

### `isOwner(user, applicationId)` / `isAdminOrOwner(user, applicationId)`

Check if user has owner or admin role in an application.

## Examples

### Grant Anonymous Access to a Page

```bash
curl -X POST "http://localhost/api/resources/page/{pageId}/make-anonymous" \
  -H "Content-Type: application/json" \
  -d '{"permission": "read"}'
```

### Remove Anonymous Access

```bash
curl -X DELETE "http://localhost/api/resources/page/{pageId}/make-anonymous"
```

### Grant Role-Based Access

```bash
curl -X POST "http://localhost/api/resources/page/{pageId}/role-permission" \
  -H "Content-Type: application/json" \
  -d '{"roleName": "editor", "permission": "write"}'
```

### Share with Specific User

```bash
curl -X POST "http://localhost/api/resources/page/{pageId}/share" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid",
    "permission": "read",
    "expiresAt": "2024-12-31T23:59:59Z"
  }'
```
