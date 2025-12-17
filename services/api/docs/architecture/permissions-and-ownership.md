# Permissions and Ownership Architecture

## Overview

This document describes the permissions and ownership architecture of the API, which controls access to resources (applications, pages, components) through a **consolidated 3-table model**:

1. **ApplicationRole** - System and custom roles per application
2. **ApplicationMember** - User role assignments within applications
3. **ResourcePermission** - Fine-grained access control for specific resources

The system uses a **hybrid authentication/authorization model**:
- **Keycloak** handles authentication and global identity
- **API** handles application-scoped authorization

**Note:** The `user_id` field on entities (Application, Page, Component) tracks the original creator for reference purposes.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Core Concepts](#core-concepts)
- [Database Models](#database-models)
- [Application-Scoped Roles](#application-scoped-roles)
- [Resource-Level Permissions](#resource-level-permissions-dynamic-access)
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
│  │  • ApplicationRole: system + custom roles per application            │  │
│  │  • ApplicationMember: user roles per application (owner/admin/...)   │  │
│  │  • ResourcePermission: fine-grained access to specific resources     │  │
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

### Unified Access Control Model

The system implements a **unified access control model** with three components:

1. **Application Roles** - Define permissions available within each application (system + custom)
2. **Application Membership** - Assign users to roles within specific applications
3. **Resource Permissions** - Grant fine-grained access to specific pages/components/files

A user can access a resource if they have:
- An **application role** with the required permission, OR
- An explicit **resource permission** for that specific resource

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

The permission system uses **three core tables**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA MODEL                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ApplicationRole ◄──────┐                                                  │
│   (system + custom)      │ role_id                                          │
│          │               │                                                  │
│          │               │                                                  │
│          ▼               │                                                  │
│   permissions[]          │                                                  │
│                          │                                                  │
│                  ApplicationMember                                          │
│                  (user ↔ app ↔ role)                                        │
│                                                                             │
│                                                                             │
│   ResourcePermission                                                        │
│   (fine-grained access to specific resources)                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

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
1. Create the Application record (with `user_id` = creator)
2. Create ApplicationMember with system `owner` role

```
Creator ──► Application (user_id = creator)
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

## Resource-Level Permissions (Dynamic Access)

Beyond application-scoped roles, the system supports **fine-grained access control** for specific resources (pages, components, files). This enables scenarios like:

- Grant a user access to **one specific page** without access to the entire application
- Allow external reviewers to view **only certain components**
- Share a **single file** with a collaborator

### Permission Layers

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PERMISSION CHECK ORDER                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   1. Resource-Level Permission (most specific)                              │
│      └── Does user have explicit permission on THIS page/component/file?   │
│                           │                                                 │
│                           ▼ if not found                                    │
│   2. Application Role                                                       │
│      └── Does user's role in the app grant this permission?                │
│                           │                                                 │
│                           ▼ if not found                                    │
│   3. Public/Anonymous Access                                                │
│      └── Is this resource publicly accessible?                              │
│                           │                                                 │
│                           ▼ if not found                                    │
│                          DENY                                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### ResourcePermission Table

Stores dynamic permissions for specific resources.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ResourcePermission                                  │
├────────────────┬─────────────┬──────────────────────────────────────────────┤
│ Column         │ Type        │ Description                                  │
├────────────────┼─────────────┼──────────────────────────────────────────────┤
│ id             │ INT (PK)    │ Auto-increment identifier                    │
│ resource_id    │ STRING      │ UUID of the resource (page/component/file)   │
│ resource_type  │ STRING      │ Type: page, component, file                  │
│ grantee_type   │ STRING      │ user, role, public, anonymous                │
│ grantee_id     │ STRING      │ User UUID or Role ID (NULL for public)       │
│ permission     │ STRING      │ Permission: read, write, delete, share       │
│ granted_by     │ STRING      │ User who granted this permission             │
│ expires_at     │ TIMESTAMP   │ Optional expiration (NULL = permanent)       │
│ created_at     │ TIMESTAMP   │ When permission was granted                  │
├────────────────┴─────────────┴──────────────────────────────────────────────┤
│ UNIQUE (resource_id, resource_type, grantee_type, grantee_id, permission)   │
│ INDEX (resource_id, resource_type)                                          │
│ INDEX (grantee_id, grantee_type)                                            │
│ INDEX (expires_at) WHERE expires_at IS NOT NULL                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Grantee Types

| Type | Description | Example |
|------|-------------|---------|
| `user` | Specific user by UUID | Grant read access to user X |
| `role` | Application role | All editors can view this page |
| `public` | Anyone with the link | Public portfolio page |
| `anonymous` | Unauthenticated users | Landing page |

### Resource Permission Types

| Permission | Description |
|------------|-------------|
| `read` | View the resource |
| `write` | Modify the resource |
| `delete` | Remove the resource |
| `share` | Grant permissions to others |

### Access Check Flow

```
Request to access Page X
              │
              ▼
┌─────────────────────────────────┐
│ 1. Check ResourcePermission     │
│    WHERE resource_id = X        │
│    AND resource_type = 'page'   │
│    AND grantee matches user     │
│    AND (expires_at IS NULL      │
│         OR expires_at > NOW)    │
└─────────────────────────────────┘
              │
         found? ─── YES ──► GRANT based on permission
              │
              NO
              ▼
┌─────────────────────────────────┐
│ 2. Check ApplicationMember      │
│    Get user's role in app       │
│    Check role.permissions       │
└─────────────────────────────────┘
              │
         found? ─── YES ──► GRANT based on role
              │
              NO
              ▼
┌─────────────────────────────────┐
│ 3. Check Public/Anonymous       │
│    Is resource public or        │
│    anonymous-accessible?        │
└─────────────────────────────────┘
              │
         public? ─── YES ──► GRANT read permission
              │
              NO
              ▼
           DENY
```

### Use Cases

#### 1. Share a Page with External User

User who has no application role can access a specific page:

```
ResourcePermission:
├── resource_id: "page-uuid-123"
├── resource_type: "page"
├── grantee_type: "user"
├── grantee_id: "external-user-uuid"
├── permission: "read"
├── granted_by: "owner-uuid"
└── expires_at: "2025-01-15T00:00:00Z"
```

#### 2. Make a Component Public

Anyone can view this component (e.g., embedded widget):

```
ResourcePermission:
├── resource_id: "component-uuid-456"
├── resource_type: "component"
├── grantee_type: "public"
├── grantee_id: NULL
├── permission: "read"
├── granted_by: "owner-uuid"
└── expires_at: NULL
```

#### 3. Grant Edit Access to Specific File

Allow a user to edit one file in the application:

```
ResourcePermission:
├── resource_id: "file-uuid-789"
├── resource_type: "file"
├── grantee_type: "user"
├── grantee_id: "collaborator-uuid"
├── permission: "write"
├── granted_by: "owner-uuid"
└── expires_at: NULL
```

#### 4. Role-Based Page Access

All users with "reviewer" role can access this page:

```
ResourcePermission:
├── resource_id: "page-uuid-review"
├── resource_type: "page"
├── grantee_type: "role"
├── grantee_id: "reviewer-role-id"
├── permission: "read"
├── granted_by: "owner-uuid"
└── expires_at: NULL
```

### Permission Inheritance

Resources can inherit permissions from their parent:

```
Application (App A)
    │
    ├── Page 1 ──► inherits from App A
    │      │
    │      └── Component 1 ──► inherits from Page 1 OR App A
    │
    └── Page 2 (has explicit ResourcePermission)
           │
           └── Component 2 ──► inherits from Page 2 (NOT App A)
```

**Inheritance Rules:**
- If resource has explicit `ResourcePermission` → use it
- Else check parent resource permissions
- Else fall back to application role
- Else check ownership

### Sharing Permissions

Users with `share` permission on a resource can grant permissions to others.

**Rules:**
- Can only grant permissions they themselves have
- Cannot grant `share` permission unless they are owner
- Cannot grant permissions that exceed their own access level

### Permission Revocation

Permissions can be revoked by:
- The user who granted them (`granted_by`)
- Application owner
- Application admin (for non-owner grants)

### Expiring Permissions

Temporary access can be granted using `expires_at`:

| Use Case | Expiration |
|----------|------------|
| Review period | 7 days |
| Client preview | 30 days |
| Temporary collaboration | Custom date |
| Permanent access | NULL |

**Cleanup:** A scheduled job removes expired permissions.

### API Endpoints for Resource Permissions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/resources/{type}/{id}/permissions` | List permissions for a resource |
| POST | `/api/resources/{type}/{id}/permissions` | Grant permission |
| DELETE | `/api/resources/{type}/{id}/permissions/{permId}` | Revoke permission |
| GET | `/api/users/{userId}/resource-permissions` | List resources user can access |
| POST | `/api/resources/{type}/{id}/share` | Generate shareable link |

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
const ANONYMOUS_USER: User = {
  anonymous: true,
  uuid: '00000000-0000-0000-0000-000000000000',
  username: 'anonymous',
  roles: []
};

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const headerValue = req.header('X-USER');

  // Validate gateway origin when X-USER header is present
  if (headerValue && !validateGatewayOrigin(req)) {
    return res.status(403).json({ message: 'Forbidden: Invalid gateway credentials' });
  }

  try {
    const user: User = JSON.parse(headerValue as string);
    if (!isValidUserObject(user)) throw new Error('Invalid user');
    (req as any).user = user;
    next();
  } catch (error) {
    // Fallback to anonymous user
    (req as any).user = { ...ANONYMOUS_USER };
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
┌────────┐   ┌────────────┐   ┌────────────┐   ┌────────────┐   ┌──────────┐
│ Client │   │ Middleware │   │ Controller │   │ Permission │   │ Database │
└───┬────┘   └─────┬──────┘   └─────┬──────┘   │  Service   │   └────┬─────┘
    │              │                │          └─────┬──────┘        │
    │ HTTP Request │                │                │               │
    │──────────────►                │                │               │
    │              │                │                │               │
    │              │ Extract User   │                │               │
    │              │───────────────►│                │               │
    │              │                │                │               │
    │              │                │ Check Access   │               │
    │              │                │───────────────►│               │
    │              │                │                │               │
    │              │                │                │ Query         │
    │              │                │                │──────────────►│
    │              │                │                │               │
    │              │                │                │◄──────────────│
    │              │                │                │   Results     │
    │              │                │◄───────────────│               │
    │              │                │  Allowed IDs   │               │
    │              │                │                │               │
    │◄─────────────────────────────│                │               │
    │        Filtered Response     │                │               │
```

### Controller Authorization Pattern

```typescript
@Get()
public async findAll(@Request() request: NRequest): Promise<Application[]> {
  // 1. Check user's application membership
  const memberApps = await this.applicationMemberService
    .getApplicationsForUser(request.user.uuid, 'application:read');

  // 2. Check explicit resource permissions
  const permittedApps = await this.resourcePermissionService
    .getAccessibleResources(request.user.uuid, 'application', 'read');

  // 3. Return only accessible resources
  const accessibleIds = [...new Set([...memberApps, ...permittedApps])];
  return await this.applicationService.findAll(accessibleIds);
}
```

---

## Resource Hierarchy

### Resource Structure

```
User
 │
 ├── Application (user_id = creator, ApplicationMember for access)
 │    │
 │    ├── Pages (user_id = creator, linked via application_id)
 │    │    │
 │    │    └── Components (referenced via component_ids array)
 │    │
 │    └── Components (user_id = creator, linked via application_id)
 │
 └── ResourcePermission (fine-grained access grants)
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

### Resource Permission Endpoints

| Method | Endpoint | Description | Required Permission |
|--------|----------|-------------|---------------------|
| GET | `/api/resources/{type}/{id}/permissions` | List permissions for resource | `share` or owner |
| POST | `/api/resources/{type}/{id}/permissions` | Grant permission | `share` or owner |
| DELETE | `/api/resources/{type}/{id}/permissions/{permId}` | Revoke permission | `share` or owner |
| GET | `/api/users/{userId}/resource-permissions` | List accessible resources | (self only) |
| POST | `/api/resources/{type}/{id}/share` | Generate shareable link | `share` or owner |

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
| **Resource Permissions** | |
| ResourcePermission Model | `src/resource-permission/models/resource-permission.ts` |
| ResourcePermission Service | `src/resource-permission/services/resource-permission.service.ts` |
| ResourcePermission Repository | `src/resource-permission/repositories/resource-permission.repository.ts` |
| ResourcePermission Controller | `src/resource-permission/controllers/resource-permission.controller.ts` |
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
export class ResourcePermissionService {
  constructor(
    @inject('ResourcePermissionRepository') private repository: IResourcePermissionRepository,
    @inject('ApplicationMemberRepository') private memberRepository: IApplicationMemberRepository
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

### Why Consolidated 3-Table Model?

1. **Single Source of Truth** - No redundant tables storing the same data
2. **Simpler Mental Model** - Roles for applications, permissions for specific resources
3. **Flexible Sharing** - ResourcePermission handles users, roles, public, and anonymous access
4. **Creator Tracking** - `user_id` on entities tracks who created what (informational only)
5. **Clean Separation** - ApplicationMember for app access, ResourcePermission for fine-grained control

### Why JSON for Permissions in Roles?

1. **Flexibility** - Easy to add new permission types
2. **Wildcard Support** - `page:*` matches all page permissions
3. **No Schema Changes** - Adding new permissions doesn't require migration
4. **Query Support** - PostgreSQL JSON operators enable efficient checks

---

## Future Considerations

1. **Organization/Team Support** - Add organization model for multi-tenant scenarios
2. **Audit Logging** - Track permission and role changes for compliance
3. **Permission Caching** - Cache role permission checks for performance (Redis)
4. **Batch Permission Checks** - Optimize multiple permission checks in single query
5. **Role Templates** - Pre-built role templates for common use cases
6. **Invitation Flow** - Email-based member invitations with acceptance workflow
7. **Rate Limiting** - Prevent permission enumeration attacks
