---
sidebar_position: 1
---

# Security & Permissions

Nuraly provides a comprehensive security system for controlling access to applications, pages, and components. This section covers authentication, authorization, and resource-level permissions.

## Overview

The security system consists of three layers:

1. **Authentication** - Handled by Keycloak (OpenID Connect)
2. **Authorization** - Role-based access control (RBAC)
3. **Resource Permissions** - Fine-grained access control per resource

```
┌─────────────────────────────────────────────────────────────┐
│                         Gateway                              │
│  ┌─────────────────┐    ┌─────────────────────────────────┐ │
│  │   Keycloak      │    │      Permission Check           │ │
│  │   Auth Check    │───▶│   (Anonymous/Public/Role)       │ │
│  └─────────────────┘    └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                          API                                 │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              Authorization Service                       ││
│  │   - Unified canAccess() for all resources               ││
│  │   - Applications, pages, components treated equally     ││
│  │   - Role hierarchy                                       ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Key Concepts

### Grantee Types

| Type | Description |
|------|-------------|
| `user` | Specific user by UUID |
| `role` | Users with a specific role |
| `public` | Any authenticated user with the link |
| `anonymous` | Anyone, including unauthenticated users |

### Permission Types

| Permission | Description |
|------------|-------------|
| `read` | View the resource |
| `write` | Modify the resource |
| `delete` | Remove the resource |
| `share` | Grant access to others |

### Resource Types

- **Application** - Top-level container
- **Page** - Individual pages within an application
- **Component** - UI components within pages

## Documentation

- [Resource Permissions](./resource-permissions) - Detailed permission system documentation
- [Anonymous Access](./anonymous-access) - Public and anonymous access configuration
- [Role-Based Access](./role-based-access) - RBAC system documentation
