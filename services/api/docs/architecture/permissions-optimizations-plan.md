# Permissions & Ownership Optimizations Plan

## Overview

This document tracks planned optimizations and improvements for the permissions and ownership architecture identified during architecture review.

**Created:** 2025-12-17
**Status:** Planning
**Related Doc:** [permissions-and-ownership.md](./permissions-and-ownership.md)

---

## Priority Legend

| Priority | Description | Timeline |
|----------|-------------|----------|
| P0 | Critical - Security risk | Immediate |
| P1 | High - Should fix soon | Short-term |
| P2 | Medium - Important improvement | Medium-term |
| P3 | Low - Nice to have | Long-term |

## Status Legend

| Status | Description |
|--------|-------------|
| `[ ]` | Not started |
| `[~]` | In progress |
| `[x]` | Completed |
| `[-]` | Cancelled/Deferred |

---

## P0 - Critical (Security)

### 1. [ ] Validate X-USER Header Origin

**Problem:** The system trusts X-USER header without validation. If the API gateway is bypassed, attackers can impersonate any user.

**Current Code:** `src/middlewares/user.middleware.ts`
```typescript
const user: User = JSON.parse(headerValue as string);
(req as any).user = user;
```

**Solution:**
- Add header signature validation
- Verify request originates from trusted gateway (IP whitelist or shared secret)
- Reject requests with X-USER header from untrusted sources

**Files to Modify:**
- [ ] `src/middlewares/user.middleware.ts`
- [ ] Add configuration for trusted origins

**Acceptance Criteria:**
- [ ] Requests with X-USER from untrusted sources are rejected
- [ ] Signature/origin validation is configurable
- [ ] Unit tests cover bypass attempts

---

### 2. [ ] Fix Anonymous User Flag

**Problem:** Anonymous user fallback sets `anonymous: false` which is incorrect.

**Current Code:** `src/middlewares/user.middleware.ts:268-270`
```typescript
(req as any).user = {
  anonymous: false,  // BUG: Should be true
  uuid: '0000-0000-0000-0000',
  ...
};
```

**Solution:**
- Change `anonymous: false` to `anonymous: true`
- Review all permission checks that use the anonymous flag

**Files to Modify:**
- [ ] `src/middlewares/user.middleware.ts`

**Acceptance Criteria:**
- [ ] Anonymous users have `anonymous: true`
- [ ] Permission checks correctly handle anonymous flag
- [ ] Unit tests verify anonymous user behavior

---

## P1 - High Priority

### 3. [ ] Add Middleware-Based Permission Enforcement

**Problem:** Permission checks are done manually in each controller. Easy to forget, leading to privilege escalation.

**Current Pattern:**
```typescript
@Get()
public async findAll(@Request() request: NRequest) {
  // Manual permission check - easy to forget
  const accessibleIds = await this.ownershipService.getResourceIDWithPermissionOrOwner(...);
}
```

**Solution:**
- Create permission decorator/middleware
- Define required permissions in route configuration
- Automatically enforce before controller execution

**Proposed Pattern:**
```typescript
@Get()
@RequiresPermission(ResourceType.application, ApplicationPermission.read)
public async findAll(@Request() request: NRequest) {
  // Permission already enforced
}
```

**Files to Create/Modify:**
- [ ] Create `src/decorators/requires-permission.decorator.ts`
- [ ] Create `src/middlewares/permission-guard.middleware.ts`
- [ ] Update controllers to use decorator

**Acceptance Criteria:**
- [ ] Decorator enforces permission checks automatically
- [ ] Unauthorized requests return 403
- [ ] All existing endpoints migrated to use decorator
- [ ] Integration tests verify enforcement

---

### 4. [ ] Add Database Constraints

**Problem:** No unique constraints or indexes on Ownership/Permission tables.

**Current Schema Issues:**
- Duplicate ownership records possible
- No referential integrity
- Missing indexes for query performance

**Solution:**
Add Prisma schema constraints:

```prisma
model Ownership {
  id           Int    @id @default(autoincrement())
  ownerId      String @map("owner_id")
  resourceId   String @map("resource_id")
  resourceType String @map("resource_type")

  @@unique([ownerId, resourceId, resourceType])
  @@index([resourceId, resourceType])
  @@index([ownerId, resourceType])
}

model Permission {
  id             Int     @id @default(autoincrement())
  userId         String  @map("user_id")
  resourceId     String  @map("resource_id")
  resourceType   String  @map("resource_type")
  permissionType String  @map("permission_type")

  @@unique([resourceId, resourceType, permissionType])
  @@index([resourceId, resourceType])
  @@index([userId])
}
```

**Files to Modify:**
- [ ] `prisma/schema.prisma`
- [ ] Create migration

**Acceptance Criteria:**
- [ ] Unique constraint prevents duplicate ownership
- [ ] Indexes improve query performance
- [ ] Migration runs successfully
- [ ] Existing data validated before migration

---

### 5. [ ] Add Cascade Delete for Permissions

**Problem:** When resources are deleted, orphan Ownership/Permission records remain.

**Solution:**
- Add cleanup logic when resources are deleted
- Option A: Database triggers
- Option B: Service-level cleanup

**Proposed Implementation (Service-level):**
```typescript
// ApplicationService.delete()
async delete(uuid: string, userId: string) {
  // 1. Delete child pages and components
  await this.pageService.deleteByApplication(uuid);
  await this.componentService.deleteByApplication(uuid);

  // 2. Delete permissions
  await this.permissionService.deleteByResource(uuid, 'application');

  // 3. Delete ownership
  await this.ownershipService.deleteByResource(uuid, 'application');

  // 4. Delete application
  await this.applicationRepository.delete(uuid);
}
```

**Files to Modify:**
- [ ] `src/application/services/application.service.ts`
- [ ] `src/page/services/page.service.ts`
- [ ] `src/component/services/component.service.ts`
- [ ] `src/ownership/services/ownership.service.ts`
- [ ] `src/permission/services/permission.service.ts`

**Acceptance Criteria:**
- [ ] Deleting application removes all associated permissions/ownership
- [ ] Deleting page removes its permissions/ownership
- [ ] No orphan records after deletion
- [ ] Transaction ensures atomicity

---

### 6. [ ] Add Audit Logging

**Problem:** No tracking of who changed permissions and when.

**Solution:**
Create audit log for permission-related actions:

```prisma
model PermissionAuditLog {
  id           Int      @id @default(autoincrement())
  action       String   // CREATE, UPDATE, DELETE
  resourceId   String
  resourceType String
  actorId      String   // Who made the change
  targetId     String?  // Who was affected (for grants)
  oldValue     Json?
  newValue     Json?
  timestamp    DateTime @default(now())
  ipAddress    String?

  @@index([resourceId, resourceType])
  @@index([actorId])
  @@index([timestamp])
}
```

**Files to Create/Modify:**
- [ ] Add model to `prisma/schema.prisma`
- [ ] Create `src/audit/services/audit.service.ts`
- [ ] Integrate into permission/ownership services

**Acceptance Criteria:**
- [ ] All permission changes are logged
- [ ] Logs include actor, action, before/after state
- [ ] Logs are queryable by resource, actor, time
- [ ] Sensitive data is not logged

---

## P2 - Medium Priority

### 7. [ ] Implement Permission Inheritance

**Problem:** Granting access to an application doesn't grant access to its pages/components.

**Current Behavior:**
```
User has READ on Application A
User tries to read Page P (belongs to A)
→ ACCESS DENIED (must explicitly grant page permission)
```

**Desired Behavior:**
```
User has READ on Application A
User tries to read Page P (belongs to A)
→ ACCESS GRANTED (inherited from application)
```

**Solution:**
Modify permission check to walk up hierarchy:

```typescript
async checkPermission(userId: string, resourceId: string, resourceType: string, permissionType: string): Promise<boolean> {
  // 1. Check direct permission
  if (await this.hasDirectPermission(userId, resourceId, resourceType, permissionType)) {
    return true;
  }

  // 2. Check parent permission (if applicable)
  const parent = await this.getParentResource(resourceId, resourceType);
  if (parent) {
    return this.checkPermission(userId, parent.id, parent.type, permissionType);
  }

  return false;
}
```

**Files to Modify:**
- [ ] `src/ownership/services/ownership.service.ts`
- [ ] `src/ownership/repositories/ownership.repository.ts`

**Acceptance Criteria:**
- [ ] Page permissions inherit from parent application
- [ ] Component permissions inherit from parent page/application
- [ ] Direct permissions override inherited permissions
- [ ] Performance is acceptable (consider caching)

---

### 8. [ ] Consolidate Ownership Storage

**Problem:** Ownership stored in two places:
1. `user_id` field on entities
2. `Ownership` table

**Options:**

**Option A: Remove user_id from entities**
- Pros: Single source of truth
- Cons: Requires join for every owner lookup

**Option B: Remove Ownership table**
- Pros: Simpler queries
- Cons: Loses flexibility for multiple owners

**Option C: Keep both, add sync mechanism**
- Pros: Backward compatible
- Cons: More complexity

**Recommendation:** Option A - use Ownership table as single source of truth

**Files to Modify:**
- [ ] `prisma/schema.prisma` (remove user_id from entities)
- [ ] All services that reference user_id
- [ ] All repositories
- [ ] Migration to move data

**Acceptance Criteria:**
- [ ] Ownership is stored in one location
- [ ] All existing functionality preserved
- [ ] Migration handles existing data
- [ ] Documentation updated

---

### 9. [ ] Add Rate Limiting for Permission Checks

**Problem:** No rate limiting allows permission enumeration attacks.

**Solution:**
- Add rate limiting middleware for permission-related endpoints
- Implement exponential backoff for failed checks

**Files to Create/Modify:**
- [ ] Create `src/middlewares/rate-limit.middleware.ts`
- [ ] Apply to permission endpoints

**Acceptance Criteria:**
- [ ] Rate limits prevent enumeration attacks
- [ ] Legitimate users not impacted
- [ ] Limits are configurable

---

## P3 - Low Priority

### 10. [ ] Add Permission Caching

**Problem:** Permission checks hit database on every request.

**Solution:**
- Implement caching layer (Redis)
- Cache permission results with TTL
- Invalidate on permission changes

**Files to Create/Modify:**
- [ ] Create `src/cache/permission-cache.service.ts`
- [ ] Integrate with ownership service
- [ ] Add cache invalidation hooks

**Acceptance Criteria:**
- [ ] Repeated permission checks use cache
- [ ] Cache invalidates on permission changes
- [ ] Configurable TTL
- [ ] Metrics for cache hit/miss rates

---

### 11. [ ] Add Permission Expiry/TTL

**Problem:** Granted permissions last forever.

**Solution:**
Add expiry field to Permission model:

```prisma
model Permission {
  // ... existing fields
  expiresAt DateTime?
}
```

**Files to Modify:**
- [ ] `prisma/schema.prisma`
- [ ] `src/permission/services/permission.service.ts`
- [ ] Add cleanup job for expired permissions

**Acceptance Criteria:**
- [ ] Permissions can have optional expiry
- [ ] Expired permissions are not honored
- [ ] Background job cleans up expired records

---

### 12. [ ] Add Organization/Team Support

**Problem:** No multi-tenancy support for teams/organizations.

**Solution:**
Add Organization and Team models:

```prisma
model Organization {
  id        String   @id @default(uuid())
  name      String
  members   OrganizationMember[]
  teams     Team[]
}

model Team {
  id             String   @id @default(uuid())
  name           String
  organizationId String
  members        TeamMember[]
}
```

**Files to Create:**
- [ ] `src/organization/` module
- [ ] `src/team/` module
- [ ] Update permission system for org/team grants

**Acceptance Criteria:**
- [ ] Users can belong to organizations
- [ ] Teams can be created within organizations
- [ ] Permissions can be granted to teams/orgs
- [ ] Resource ownership can transfer to org

---

### 13. [ ] Add Ownership Transfer Mechanism

**Problem:** No way to transfer resource ownership.

**Solution:**
Add ownership transfer endpoint and service method:

```typescript
async transferOwnership(
  resourceId: string,
  resourceType: string,
  fromUserId: string,
  toUserId: string
): Promise<void> {
  // Validate current owner
  // Update ownership record
  // Log audit trail
  // Notify users
}
```

**Files to Modify:**
- [ ] `src/ownership/services/ownership.service.ts`
- [ ] `src/ownership/controllers/ownership.controller.ts`
- [ ] Add transfer request/approval workflow (optional)

**Acceptance Criteria:**
- [ ] Owner can transfer ownership to another user
- [ ] Transfer is atomic
- [ ] Audit log records transfer
- [ ] Previous owner loses access (unless explicitly permitted)

---

## Progress Tracking

| ID | Task | Priority | Status | Assignee | Notes |
|----|------|----------|--------|----------|-------|
| 1 | Validate X-USER Header | P0 | [ ] | - | Security critical |
| 2 | Fix Anonymous Flag | P0 | [ ] | - | Quick fix |
| 3 | Permission Middleware | P1 | [ ] | - | Major refactor |
| 4 | Database Constraints | P1 | [ ] | - | Migration required |
| 5 | Cascade Delete | P1 | [ ] | - | |
| 6 | Audit Logging | P1 | [ ] | - | |
| 7 | Permission Inheritance | P2 | [ ] | - | |
| 8 | Consolidate Ownership | P2 | [ ] | - | Breaking change |
| 9 | Rate Limiting | P2 | [ ] | - | |
| 10 | Permission Caching | P3 | [ ] | - | Requires Redis |
| 11 | Permission Expiry | P3 | [ ] | - | |
| 12 | Org/Team Support | P3 | [ ] | - | Major feature |
| 13 | Ownership Transfer | P3 | [ ] | - | |

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2025-12-17 | Initial plan created | - |
