# Access Control Panel - API Integration Plan

## Overview

Update the AccessRoles component to call the ResourcePermission API directly instead of storing permissions on the page object.

## Backend API Endpoints

Based on the backend documentation:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/resources/{type}/{id}/permissions` | List permissions for a resource |
| POST | `/api/resources/{type}/{id}/permissions` | Grant permission |
| DELETE | `/api/resources/{type}/{id}/permissions/{permId}` | Revoke permission |

## Implementation Steps

### Step 1: Create ResourcePermission API Handler

**File:** `src/features/runtime/redux/handlers/permissions/resource-permission.handler.ts`

Create a new handler file with functions:
- `getResourcePermissions(resourceType, resourceId)` - GET permissions
- `grantResourcePermission(resourceType, resourceId, data)` - POST new permission
- `revokeResourcePermission(resourceType, resourceId, permissionId)` - DELETE permission

### Step 2: Add API URLs

**File:** `src/features/runtime/redux/handlers/api-urls.ts`

Add new URL patterns:
```typescript
RESOURCE_PERMISSIONS: "/api/resources/{type}/{id}/permissions",
RESOURCE_PERMISSION: "/api/resources/{type}/{id}/permissions/{permId}",
```

### Step 3: Expose API Functions to Handler Code

**File:** `src/features/runtime/handlers/runtime-api/index.ts` (or create new file)

Make the permission functions available in handler code:
- `Permissions.getForResource(type, id)`
- `Permissions.grant(type, id, data)`
- `Permissions.revoke(type, id, permissionId)`

### Step 4: Update AccessRoles Component

**File:** `src/features/runtime/components/ui/components/utility/AccessRoles/AccessRoles.ts`

Changes:
- Add `connectedCallback` to load permissions from API on mount
- Add loading state while fetching
- Update methods to call API directly instead of emitting events
- Handle API errors with user feedback

### Step 5: Update Access Control Block

**File:** `src/features/studio/blocks/page-blocks/studio-page-access-control-block.ts`

Changes:
- Remove page storage logic from event handlers
- Simplify input handler to just pass page ID and app ID
- Let the component handle all API calls

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    AccessRoles Component                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. On Mount:                                                    │
│     GET /api/resources/page/{pageId}/permissions                 │
│     └─► Parse response into is_public, is_anonymous, roles       │
│                                                                  │
│  2. Toggle Public:                                               │
│     POST /api/resources/page/{pageId}/permissions                │
│     Body: { grantee_type: 'public', permission: 'read' }         │
│     OR                                                           │
│     DELETE /api/resources/page/{pageId}/permissions/{id}         │
│                                                                  │
│  3. Toggle Anonymous:                                            │
│     POST /api/resources/page/{pageId}/permissions                │
│     Body: { grantee_type: 'anonymous', permission: 'read' }      │
│     OR                                                           │
│     DELETE /api/resources/page/{pageId}/permissions/{id}         │
│                                                                  │
│  4. Add Role Permission:                                         │
│     POST /api/resources/page/{pageId}/permissions                │
│     Body: { grantee_type: 'role', grantee_id: roleId, ... }      │
│                                                                  │
│  5. Update Role Permission:                                      │
│     DELETE old + POST new (or PUT if API supports)               │
│                                                                  │
│  6. Remove Role Permission:                                      │
│     DELETE /api/resources/page/{pageId}/permissions/{id}         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Files to Create/Modify

| Action | File |
|--------|------|
| CREATE | `src/features/runtime/redux/handlers/permissions/resource-permission.handler.ts` |
| MODIFY | `src/features/runtime/redux/handlers/api-urls.ts` |
| MODIFY | `src/features/runtime/handlers/handler-api-factory.ts` (expose to handlers) |
| MODIFY | `src/features/runtime/components/ui/components/utility/AccessRoles/AccessRoles.ts` |
| MODIFY | `src/features/studio/blocks/page-blocks/studio-page-access-control-block.ts` |

## Component State

```typescript
interface AccessRolesState {
  loading: boolean;
  error: string | null;
  permissions: ResourcePermission[];
}
```

## Error Handling

- Show loading spinner while fetching
- Display error messages for failed API calls
- Optimistic updates with rollback on failure (optional)

## Questions for Clarification

1. Should the component use optimistic updates (update UI immediately, rollback on error)?
2. Is there a PUT endpoint for updating permissions, or should we DELETE + POST?
3. Should we cache permissions or always fetch fresh data?
