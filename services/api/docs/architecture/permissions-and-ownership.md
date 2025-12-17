# Permissions and Ownership Architecture

## Overview

This document describes the permissions and ownership architecture of the API, which controls access to resources (applications, pages, components) through a combination of direct ownership records and explicit permission grants with role-based access control (RBAC) support.

## Table of Contents

- [Core Concepts](#core-concepts)
- [Database Models](#database-models)
- [Ownership System](#ownership-system)
- [Permission System](#permission-system)
- [Authentication Flow](#authentication-flow)
- [Authorization Flow](#authorization-flow)
- [Resource Hierarchy](#resource-hierarchy)
- [API Endpoints](#api-endpoints)
- [Implementation Details](#implementation-details)

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
| Ownership Model | `src/ownership/models/ownership.ts` |
| Ownership Service | `src/ownership/services/ownership.service.ts` |
| Ownership Repository | `src/ownership/repositories/ownership.repository.ts` |
| Permission Model | `src/permission/models/permission.ts` |
| Permission Service | `src/permission/services/permission.service.ts` |
| Permission Repository | `src/permission/repositories/permission.repository.ts` |
| User Middleware | `src/middlewares/user.middleware.ts` |
| Auth Middleware | `src/auth/middleware/express.authentication.ts` |
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

### Why Dual Ownership/Permission Model?

1. **Ownership** provides fast, simple access checks for resource creators
2. **Permissions** enable flexible sharing without transferring ownership
3. **Separation** allows changing permissions without modifying ownership
4. **Scalability** - ownership queries are simple; permission queries handle complex cases

### Why JSON for Allowed Field?

1. **Flexibility** - Easy to add new access control types
2. **Extensibility** - Can add teams, organizations without schema changes
3. **Query Support** - PostgreSQL JSON operators enable efficient queries
4. **Simplicity** - Single field vs multiple join tables

### Permission Enforcement Location

Permissions are checked at the **controller level** (API boundary) rather than in services:

- **Pros**: Clear security boundary, services remain reusable
- **Cons**: Must remember to check in every controller
- **Mitigation**: Use middleware/decorators for consistent enforcement

---

## Future Considerations

1. **Organization/Team Support** - Add organization model for multi-tenant scenarios
2. **Permission Inheritance** - Automatically inherit permissions from parent resources
3. **Audit Logging** - Track permission changes for compliance
4. **Fine-Grained Permissions** - Custom permission types beyond read/write/delete
5. **Permission Caching** - Cache permission checks for performance
6. **Batch Permission Checks** - Optimize multiple permission checks in single query
