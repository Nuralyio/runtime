# Permissions and Ownership Architecture

## Overview

This document describes the permissions and ownership architecture of the API, which controls access to resources (applications, pages, components) through a combination of:

1. **Ownership records** - Direct ownership relationship
2. **Application-scoped roles** - Role-based membership per application
3. **Explicit permissions** - Fine-grained permission grants

The system uses a **hybrid authentication/authorization model**:
- **Keycloak** handles authentication and global identity
- **API** handles application-scoped authorization

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Core Concepts](#core-concepts)
- [Database Models](#database-models)
- [Application-Scoped Roles](#application-scoped-roles)
- [Ownership System](#ownership-system)
- [Permission System](#permission-system)
- [Authentication Flow](#authentication-flow)
- [Authorization Flow](#authorization-flow)
- [Resource Hierarchy](#resource-hierarchy)
- [API Endpoints](#api-endpoints)
- [Implementation Details](#implementation-details)

---

## Architecture Overview

### Hybrid Auth Model

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT                                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 1. Authenticate
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             KEYCLOAK                                        │
│  • User authentication (login/logout)                                       │
│  • Global identity management                                               │
│  • SSO across applications                                                  │
│  • Global roles (e.g., platform_admin)                                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 2. JWT / X-USER header
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                               API                                           │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    Application-Scoped Authorization                   │  │
│  │  • ApplicationMember: user roles per application (owner/admin/...)   │  │
│  │  • Ownership: resource ownership tracking                             │  │
│  │  • Permission: fine-grained access control                            │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Why This Approach?

| Concern | Keycloak | API |
|---------|----------|-----|
| Who is this user? | ✓ | |
| Is the user authenticated? | ✓ | |
| What global roles does user have? | ✓ | |
| What role does user have in App X? | | ✓ |
| Can user edit Page Y? | | ✓ |
| Who are the members of App X? | | ✓ |

---

## Core Concepts

### Dual Access Control Model

The system implements a **dual access control model**:

1. **Ownership** - Direct ownership relationship between users and resources
2. **Permissions** - Explicit permission grants supporting users, roles, and anonymous access

A user can access a resource if they either **own it** OR have an **explicit permission** for it.

### Resource Types

```typescript
enum ResourceType {
  application = 'application',
  component = 'component',
  provider = 'provider',
}
```

### Permission Types

```typescript
enum ApplicationPermission {
  read = 'read',    // View resource
  write = 'write',  // Modify resource
  delete = 'delete', // Remove resource
}
```

---

## Database Models

### Ownership Table

Tracks who owns which resources.

```
┌─────────────────────────────────────────────────────────────┐
│                        Ownership                            │
├──────────────┬─────────────┬────────────────────────────────┤
│ Column       │ Type        │ Description                    │
├──────────────┼─────────────┼────────────────────────────────┤
│ id           │ INT (PK)    │ Auto-increment identifier      │
│ owner_id     │ STRING      │ User UUID who owns resource    │
│ resource_id  │ STRING      │ UUID of the owned resource     │
│ resource_type│ STRING      │ Type: application/component    │
└──────────────┴─────────────┴────────────────────────────────┘
```

### Permission Table

Stores explicit permission grants with flexible access control.

```
┌─────────────────────────────────────────────────────────────┐
│                        Permission                           │
├──────────────┬─────────────┬────────────────────────────────┤
│ Column       │ Type        │ Description                    │
├──────────────┼─────────────┼────────────────────────────────┤
│ id           │ INT (PK)    │ Auto-increment identifier      │
│ user_id      │ STRING      │ User who granted permission    │
│ resource_id  │ STRING      │ UUID of the resource           │
│ resource_type│ STRING      │ Type: application/component    │
│ public       │ BOOLEAN     │ Whether publicly accessible    │
│ permission_type│ STRING    │ read/write/delete              │
│ owner_id     │ STRING      │ Original owner of resource     │
│ allowed      │ JSON        │ Access control list (see below)│
└──────────────┴─────────────┴────────────────────────────────┘
```

#### Allowed JSON Structure

The `allowed` field stores a flexible access control list:

```json
{
  "roles": ["admin", "editor", "viewer"],
  "userIds": ["user-uuid-1", "user-uuid-2"],
  "anonymous": true
}
```

| Field     | Type       | Description                          |
|-----------|------------|--------------------------------------|
| roles     | string[]   | Roles that have this permission      |
| userIds   | string[]   | Specific user UUIDs with permission  |
| anonymous | boolean    | Allow anonymous/unauthenticated access|

### ApplicationRole Table (Custom Roles per Application)

Defines roles available within each application. Includes prefilled system roles and custom roles.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ApplicationRole                                   │
├────────────────┬─────────────┬──────────────────────────────────────────────┤
│ Column         │ Type        │ Description                                  │
├────────────────┼─────────────┼──────────────────────────────────────────────┤
│ id             │ INT (PK)    │ Auto-increment identifier                    │
│ application_id │ STRING      │ Application UUID (NULL for system roles)     │
│ name           │ STRING      │ Role name (e.g., "owner", "designer")        │
│ display_name   │ STRING      │ Human-readable name                          │
│ description    │ STRING      │ Role description                             │
│ permissions    │ JSON        │ Array of permission strings                  │
│ is_system      │ BOOLEAN     │ TRUE for prefilled roles, FALSE for custom   │
│ hierarchy      │ INT         │ Role priority (higher = more permissions)    │
│ created_at     │ TIMESTAMP   │ When role was created                        │
├────────────────┴─────────────┴──────────────────────────────────────────────┤
│ UNIQUE (application_id, name)                                               │
│ INDEX (application_id)                                                      │
│ INDEX (is_system)                                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Permissions JSON Structure

```json
{
  "permissions": [
    "application:read",
    "application:write",
    "page:create",
    "page:read",
    "page:write",
    "page:delete",
    "component:create",
    "component:read",
    "component:write",
    "component:delete",
    "member:read",
    "member:invite",
    "member:update",
    "member:remove"
  ]
}
```

### ApplicationMember Table (User Role Assignments)

Assigns users to roles within specific applications.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ApplicationMember                                  │
├────────────────┬─────────────┬──────────────────────────────────────────────┤
│ Column         │ Type        │ Description                                  │
├────────────────┼─────────────┼──────────────────────────────────────────────┤
│ id             │ INT (PK)    │ Auto-increment identifier                    │
│ user_id        │ STRING      │ User UUID                                    │
│ application_id │ STRING      │ Application UUID                             │
│ role_id        │ INT (FK)    │ Reference to ApplicationRole                 │
│ created_at     │ TIMESTAMP   │ When membership was created                  │
│ updated_at     │ TIMESTAMP   │ When membership was last updated             │
├────────────────┴─────────────┴──────────────────────────────────────────────┤
│ UNIQUE (user_id, application_id)                                            │
│ INDEX (application_id)                                                      │
│ INDEX (user_id)                                                             │
│ FOREIGN KEY (role_id) REFERENCES ApplicationRole(id)                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Application-Scoped Roles

The system supports **two types of roles**:

1. **System Roles (Prefilled)** - Default roles available to all applications
2. **Custom Roles** - Application-specific roles with custom permissions

### System Roles (Prefilled)

These roles are created automatically and available to every application. They cannot be deleted but can be hidden per application.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SYSTEM ROLES (is_system = true)                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   owner ──────► admin ──────► editor ──────► viewer                        │
│   (100)         (80)          (60)           (40)     ◄── hierarchy value   │
│     │             │             │               │                           │
│     │             │             │               └── Read-only access        │
│     │             │             │                                           │
│     │             │             └── Create/edit pages & components          │
│     │             │                                                         │
│     │             └── Manage members, edit app settings                     │
│     │                                                                       │
│     └── Full control, delete app, transfer ownership                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### System Roles Data

| Name | Display Name | Hierarchy | Permissions |
|------|--------------|-----------|-------------|
| `owner` | Owner | 100 | `*` (all permissions) |
| `admin` | Administrator | 80 | `application:read,write`, `page:*`, `component:*`, `member:*` |
| `editor` | Editor | 60 | `application:read`, `page:*`, `component:*`, `member:read` |
| `viewer` | Viewer | 40 | `application:read`, `page:read`, `component:read`, `member:read` |

System roles have `application_id = NULL` and `is_system = TRUE`.

### Custom Roles (Per Application)

Application owners/admins can create custom roles with specific permissions.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      CUSTOM ROLES EXAMPLE (App: "Design Studio")            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   System Roles:     owner ► admin ► editor ► viewer                        │
│                                                                             │
│   Custom Roles:     designer (70)    reviewer (50)    commenter (30)       │
│                         │                │                │                 │
│                         │                │                └── Can only      │
│                         │                │                    add comments  │
│                         │                │                                  │
│                         │                └── Can view + approve content     │
│                         │                                                   │
│                         └── Can edit components but not pages               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Custom Role Example

| Field | Value |
|-------|-------|
| `name` | designer |
| `display_name` | Designer |
| `description` | Can edit components but not pages |
| `hierarchy` | 70 (between admin and editor) |
| `permissions` | `application:read`, `component:*`, `page:read` |
| `application_id` | uuid-of-app |
| `is_system` | FALSE |

#### Permission String Format

Permissions follow the pattern: `resource:action`

| Resource | Actions |
|----------|---------|
| `application` | `read`, `write`, `delete` |
| `page` | `create`, `read`, `write`, `delete` |
| `component` | `create`, `read`, `write`, `delete` |
| `member` | `read`, `invite`, `update`, `remove` |
| `role` | `create`, `read`, `update`, `delete` |

Special permissions:
- `*` = All permissions (owner only)
- `page:*` = All page permissions
- `component:*` = All component permissions

### Role Resolution Flow

```
User requests action on Application
              │
              ▼
┌─────────────────────────────────┐
│ 1. Get ApplicationMember        │
│    (user_id + application_id)   │
└─────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│ 2. Load ApplicationRole         │
│    (by member.role_id)          │
└─────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│ 3. Check permission in role     │
│    • Wildcard: "*" = all        │
│    • Resource: "page:*" = all   │
│    • Exact: "page:read"         │
└─────────────────────────────────┘
              │
              ▼
        GRANT or DENY
```

#### Permission Matching Rules

| Role Permission | Requested | Result |
|-----------------|-----------|--------|
| `*` | any | ✓ Grant |
| `page:*` | `page:read` | ✓ Grant |
| `page:*` | `page:write` | ✓ Grant |
| `page:read` | `page:read` | ✓ Grant |
| `page:read` | `page:write` | ✗ Deny |
| `component:*` | `page:read` | ✗ Deny |

### Role-Permission Matrix (System Roles)

| Permission | owner | admin | editor | viewer |
|------------|:-----:|:-----:|:------:|:------:|
| `application:read` | ✓ | ✓ | ✓ | ✓ |
| `application:write` | ✓ | ✓ | | |
| `application:delete` | ✓ | | | |
| `page:create` | ✓ | ✓ | ✓ | |
| `page:read` | ✓ | ✓ | ✓ | ✓ |
| `page:write` | ✓ | ✓ | ✓ | |
| `page:delete` | ✓ | ✓ | ✓ | |
| `component:create` | ✓ | ✓ | ✓ | |
| `component:read` | ✓ | ✓ | ✓ | ✓ |
| `component:write` | ✓ | ✓ | ✓ | |
| `component:delete` | ✓ | ✓ | ✓ | |
| `member:read` | ✓ | ✓ | ✓ | ✓ |
| `member:invite` | ✓ | ✓ | | |
| `member:update` | ✓ | ✓ | | |
| `member:remove` | ✓ | ✓ | | |
| `role:create` | ✓ | | | |
| `role:read` | ✓ | ✓ | | |
| `role:update` | ✓ | | | |
| `role:delete` | ✓ | | | |

### How Application Membership Works

```
┌──────────┐                      ┌─────────────┐
│  User A  │                      │   App 1     │
│  uuid-a  │                      │   uuid-1    │
└────┬─────┘                      └──────┬──────┘
     │                                   │
     │         ApplicationMember         │
     │    ┌─────────────────────────┐    │
     └────┤ user_id: uuid-a         ├────┘
          │ application_id: uuid-1  │
          │ role_id: 2 (admin)      │───────► ApplicationRole (id=2, name='admin')
          └─────────────────────────┘

Same user, different app with CUSTOM role:

┌──────────┐                      ┌─────────────┐
│  User A  │                      │   App 2     │
│  uuid-a  │                      │   uuid-2    │
└────┬─────┘                      └──────┬──────┘
     │                                   │
     │         ApplicationMember         │
     │    ┌─────────────────────────┐    │
     └────┤ user_id: uuid-a         ├────┘
          │ application_id: uuid-2  │
          │ role_id: 10 (designer)  │───────► ApplicationRole (id=10, name='designer', app=uuid-2)
          └─────────────────────────┘
```

### Membership Lifecycle

#### 1. Application Creation

When a user creates an application:
1. Create the Application record
2. Create Ownership record (for backward compatibility)
3. Create ApplicationMember with system `owner` role

```
Creator ──► Application ──► Ownership (owner)
                       └──► ApplicationMember (role: owner)
```

#### 2. Inviting Members

**Who can invite:** Users with `member:invite` permission (owner, admin)

**Rules:**
- Role must belong to this application OR be a system role
- Cannot assign role with hierarchy ≥ your own hierarchy
- Admins (80) can invite: editor (60), viewer (40), custom roles < 80
- Owners (100) can invite: any role

#### 3. Updating Member Roles

**Who can update:** Users with `member:update` permission

**Hierarchy Rules:**
- Cannot modify users with hierarchy ≥ your own
- Cannot assign roles with hierarchy ≥ your own
- Example: Admin (80) cannot change another admin or promote to admin

#### 4. Removing Members

**Who can remove:** Users with `member:remove` permission

**Rules:**
- Cannot remove users with hierarchy ≥ your own
- Cannot remove the last owner (application must always have ≥1 owner)

#### 5. Managing Custom Roles

**Who can manage:** Users with `role:create`, `role:update`, `role:delete` permissions (typically owner only)

**Rules:**
- Role name must be unique within the application
- Cannot delete system roles
- Cannot modify system role permissions
- Custom role hierarchy must be < 100 (reserved for owner)

---

## Ownership System

### How Ownership Works

When a resource is created, an ownership record is automatically created linking the creator to the resource.

```
┌──────────┐     creates      ┌─────────────┐
│   User   │ ───────────────► │ Application │
└──────────┘                  └─────────────┘
     │                              │
     │                              │
     ▼                              ▼
┌──────────────────────────────────────────┐
│              Ownership Record            │
│  owner_id: user-uuid                     │
│  resource_id: app-uuid                   │
│  resource_type: 'application'            │
└──────────────────────────────────────────┘
```

### Ownership Creation Flow

```typescript
// ApplicationService.create()
public async create(published: boolean, uuid: string, user_id: string, name?: string) {
  // 1. Create the application
  const application = await this.ApplicationRepository.create(application);

  // 2. Create ownership record
  this.ownershipService.create('application', application.uuid, user_id);

  // 3. Create default page (also creates its ownership)
  this.pageService.create("Page1", "page1", "", application.uuid, user_id, ...);

  return application;
}
```

### Checking Ownership

```typescript
// OwnershipRepository.isOwner()
async isOwner(ownerId: string, resourceId: string, resourceType: string): Promise<boolean> {
  const ownership = await this.prisma.ownership.findFirst({
    where: {
      ownerId: ownerId,
      resourceId: resourceId,
      resourceType: resourceType
    }
  });
  return ownership !== null;
}
```

---

## Permission System

### Permission Grant Structure

Permissions are explicit grants that allow access beyond ownership.

```
┌──────────────┐                    ┌──────────────┐
│  Resource    │◄───────────────────│  Permission  │
│  Owner       │    grants          │    Grant     │
└──────────────┘                    └──────────────┘
                                          │
                                          │ allows
                                          ▼
                          ┌───────────────────────────────┐
                          │     • Specific Users (UUIDs)  │
                          │     • Roles (admin, editor)   │
                          │     • Anonymous Users         │
                          └───────────────────────────────┘
```

### Permission Check Logic

The system checks permissions in the following order:

```
1. Is user the OWNER?
   └─► YES → ACCESS GRANTED
   └─► NO  → Continue to step 2

2. Does user have EXPLICIT PERMISSION?
   └─► Check if user UUID in allowed.userIds
   └─► Check if user roles overlap with allowed.roles
   └─► Check if anonymous access and user is anonymous
   └─► Any match → ACCESS GRANTED
   └─► No match → ACCESS DENIED
```

### Combined Query for Access

```typescript
// Get all resources user can access (owns OR has permission)
async getResourceIDWithPermissionOrOwner(request: ResourcePermissionRequest): Promise<string[]> {
  // Query 1: Get owned resources
  const owned = await prisma.ownership.findMany({
    where: {
      resourceType: request.resourceType,
      ownerId: request.user.uuid
    }
  });

  // Query 2: Get permitted resources
  const permitted = await prisma.permission.findMany({
    where: {
      resourceType: request.resourceType,
      permissionType: request.permissionType,
      // Check allowed JSON for user or roles
    }
  });

  return [...owned, ...permitted].map(r => r.resourceId);
}
```

---

## Authentication Flow

### User Context Extraction

User information flows through the system via HTTP headers from an upstream gateway (e.g., Keycloak).

```
┌──────────┐    X-USER header    ┌─────────────┐    parsed user    ┌────────────┐
│  Client  │ ──────────────────► │  Middleware │ ────────────────► │ Controller │
└──────────┘                     └─────────────┘                   └────────────┘
                                       │
                                       │ fallback
                                       ▼
                                 ┌─────────────┐
                                 │  Anonymous  │
                                 │    User     │
                                 └─────────────┘
```

### User Middleware

```typescript
// src/middlewares/user.middleware.ts
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const headerValue = req.header('X-USER');
  try {
    const user: User = JSON.parse(headerValue as string);
    (req as any).user = user;
    next();
  } catch (error) {
    // Fallback to anonymous user
    (req as any).user = {
      anonymous: false,
      uuid: '0000-0000-0000-0000',
      username: 'anonymous',
      roles: []
    };
    next();
  }
};
```

### User Object Structure

```typescript
interface IUser {
  uuid: string;      // Unique user identifier
  roles: string[];   // User's roles (e.g., ['admin', 'editor'])
  anonymous: boolean; // Whether user is anonymous
}
```

### JWT Authentication (Alternative)

For direct API access, JWT bearer tokens are supported:

```typescript
// src/auth/middleware/express.authentication.ts
export const expressAuthentication = (request: Request, securityName: string) => {
  if (securityName === 'bearerAuth') {
    const token = request.headers.authorization?.split(' ')[1];
    return jwt.verify(token, secretKey);
  }
};
```

---

## Authorization Flow

### Request Authorization Sequence

```
┌────────┐   ┌────────────┐   ┌────────────┐   ┌───────────┐   ┌──────────┐
│ Client │   │ Middleware │   │ Controller │   │ Ownership │   │ Database │
└───┬────┘   └─────┬──────┘   └─────┬──────┘   │  Service  │   └────┬─────┘
    │              │                │          └─────┬─────┘        │
    │ HTTP Request │                │                │              │
    │──────────────►                │                │              │
    │              │                │                │              │
    │              │ Extract User   │                │              │
    │              │───────────────►│                │              │
    │              │                │                │              │
    │              │                │ Check Access   │              │
    │              │                │───────────────►│              │
    │              │                │                │              │
    │              │                │                │ Query        │
    │              │                │                │─────────────►│
    │              │                │                │              │
    │              │                │                │◄─────────────│
    │              │                │                │   Results    │
    │              │                │◄───────────────│              │
    │              │                │  Allowed IDs   │              │
    │              │                │                │              │
    │◄─────────────────────────────│                │              │
    │        Filtered Response     │                │              │
```

### Controller Authorization Pattern

```typescript
@Get()
public async findAll(@Request() request: NRequest): Promise<Application[]> {
  // 1. Build permission request
  const resourcePermissionRequest: ResourcePermissionRequest = {
    user: request.user,
    resourceType: ResourceType.application,
    permissionType: ApplicationPermission.read
  };

  // 2. Get accessible resource IDs
  const accessibleIds = await this.ownershipService
    .getResourceIDWithPermissionOrOwner(resourcePermissionRequest);

  // 3. Return only accessible resources
  return await this.applicationService.findAll(accessibleIds);
}
```

---

## Resource Hierarchy

### Ownership Hierarchy

```
User
 │
 ├── Application (owned via Ownership table)
 │    │
 │    ├── Pages (owned via user_id, linked via application_id)
 │    │    │
 │    │    └── Components (referenced via component_ids array)
 │    │
 │    └── Components (owned via user_id, linked via application_id)
 │
 └── Direct Components (standalone, owned via Ownership table)
```

### Entity Relationships

```
┌─────────────────┐
│   Application   │
│─────────────────│
│ uuid            │◄────────────────────────────────┐
│ user_id ────────┼──► User (creator/owner)         │
│ name            │                                 │
│ published       │                                 │
│ default_page_uuid                                 │
└─────────────────┘                                 │
        │                                           │
        │ 1:N                                       │
        ▼                                           │
┌─────────────────┐                                 │
│      Page       │                                 │
│─────────────────│                                 │
│ uuid            │                                 │
│ user_id ────────┼──► User (creator/owner)         │
│ application_id ─┼─────────────────────────────────┘
│ name            │
│ url             │
│ component_ids[] ─┼──► Array of Component UUIDs
└─────────────────┘
        │
        │ N:M (via component_ids)
        ▼
┌─────────────────┐
│    Component    │
│─────────────────│
│ uuid            │
│ user_id ────────┼──► User (creator/owner)
│ application_id  │
│ component (JSON)│
└─────────────────┘
```

---

## API Endpoints

### Application Member Endpoints

| Method | Endpoint | Description | Required Permission |
|--------|----------|-------------|---------------------|
| GET | `/api/applications/{appId}/members` | List all members | `member:read` |
| POST | `/api/applications/{appId}/members` | Invite a member | `member:invite` |
| GET | `/api/applications/{appId}/members/{userId}` | Get member details | `member:read` |
| PUT | `/api/applications/{appId}/members/{userId}` | Update member role | `member:update` |
| DELETE | `/api/applications/{appId}/members/{userId}` | Remove member | `member:remove` |

### Application Role Endpoints

| Method | Endpoint | Description | Required Permission |
|--------|----------|-------------|---------------------|
| GET | `/api/applications/{appId}/roles` | List available roles | `role:read` |
| POST | `/api/applications/{appId}/roles` | Create custom role | `role:create` |
| GET | `/api/applications/{appId}/roles/{roleId}` | Get role details | `role:read` |
| PUT | `/api/applications/{appId}/roles/{roleId}` | Update custom role | `role:update` |
| DELETE | `/api/applications/{appId}/roles/{roleId}` | Delete custom role | `role:delete` |
| GET | `/api/roles/system` | List system roles | (public) |

### Ownership Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ownership` | Create ownership record |
| GET | `/api/ownership/check` | Check if user owns resource |
| GET | `/api/ownership/{resourceType}` | Get owned resources by type |

### Permission Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/permissions` | Create permission grant |
| POST | `/api/permissions/has` | Check if permission exists |
| GET | `/api/permissions/{permissionType}` | Get permissions by type |
| GET | `/api/permissions/resource/{resourceId}` | Get permissions for resource |
| PUT | `/api/permissions/{id}` | Update permission |
| DELETE | `/api/permissions/{id}` | Delete permission |

---

## Implementation Details

### Key Files

| Component | File Path |
|-----------|-----------|
| **Application Roles** | |
| ApplicationRole Model | `src/application-role/models/application-role.ts` |
| ApplicationRole Service | `src/application-role/services/application-role.service.ts` |
| ApplicationRole Repository | `src/application-role/repositories/application-role.repository.ts` |
| ApplicationRole Controller | `src/application-role/controllers/application-role.controller.ts` |
| **Application Members** | |
| ApplicationMember Model | `src/application-member/models/application-member.ts` |
| ApplicationMember Service | `src/application-member/services/application-member.service.ts` |
| ApplicationMember Repository | `src/application-member/repositories/application-member.repository.ts` |
| ApplicationMember Controller | `src/application-member/controllers/application-member.controller.ts` |
| **Ownership** | |
| Ownership Model | `src/ownership/models/ownership.ts` |
| Ownership Service | `src/ownership/services/ownership.service.ts` |
| Ownership Repository | `src/ownership/repositories/ownership.repository.ts` |
| **Permissions** | |
| Permission Model | `src/permission/models/permission.ts` |
| Permission Service | `src/permission/services/permission.service.ts` |
| Permission Repository | `src/permission/repositories/permission.repository.ts` |
| **Auth & Middleware** | |
| User Middleware | `src/middlewares/user.middleware.ts` |
| Auth Middleware | `src/auth/middleware/express.authentication.ts` |
| **Enums & Schema** | |
| Permission Enums | `src/application/interfaces/enum/application-permission.enum.ts` |
| Resource Type Enums | `src/shared/interfaces/enum/resources-type.enum.ts` |
| Database Schema | `prisma/schema.prisma` |

### Dependency Injection

Services use `tsyringe` for dependency injection:

```typescript
@injectable()
export class OwnershipService {
  constructor(
    @inject('OwnershipRepository') private repository: IOwnershipRepository,
    @inject('PermissionRepository') private permissionRepository: IPermissionRepository
  ) {}
}
```

### Security Decorators (Tsoa)

Protected endpoints use the `@Security` decorator:

```typescript
@Post()
@Security('bearerAuth')
public async create(@Body() body: CreateRequest): Promise<Response> {
  // Protected endpoint - requires valid JWT
}
```

---

## Design Decisions

### Why Hybrid Auth Model (Keycloak + API)?

| Decision | Rationale |
|----------|-----------|
| Keycloak for authentication | Industry-standard IdP, SSO support, security best practices |
| API for authorization | Application-scoped roles are dynamic, local queries are faster |
| Separation of concerns | Identity ≠ Authorization, each system does one thing well |

### Why Application-Scoped Roles?

1. **Flexibility** - Users can have different permissions in different apps
2. **Custom Roles** - Each app can define roles specific to its workflow
3. **Hierarchy System** - Prevents privilege escalation via hierarchy checks
4. **Local Control** - No need to modify Keycloak for app-specific roles

### Why System + Custom Roles?

| System Roles | Custom Roles |
|--------------|--------------|
| Consistent across all apps | App-specific workflows |
| Always available | Created as needed |
| Cannot be deleted | Can be modified/deleted |
| Cover common use cases | Cover edge cases |

### Why Dual Ownership/Permission Model?

1. **Ownership** provides fast, simple access checks for resource creators
2. **Permissions** enable flexible sharing without transferring ownership
3. **Separation** allows changing permissions without modifying ownership
4. **Scalability** - ownership queries are simple; permission queries handle complex cases

### Why JSON for Permissions in Roles?

1. **Flexibility** - Easy to add new permission types
2. **Wildcard Support** - `page:*` matches all page permissions
3. **No Schema Changes** - Adding new permissions doesn't require migration
4. **Query Support** - PostgreSQL JSON operators enable efficient checks

---

## Future Considerations

1. **Organization/Team Support** - Add organization model for multi-tenant scenarios
2. **Permission Inheritance** - Automatically inherit permissions from parent resources
3. **Audit Logging** - Track permission and role changes for compliance
4. **Permission Caching** - Cache role permission checks for performance
5. **Batch Permission Checks** - Optimize multiple permission checks in single query
6. **Role Templates** - Pre-built role templates for common use cases
7. **Invitation Flow** - Email-based member invitations with acceptance workflow
