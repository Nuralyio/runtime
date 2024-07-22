import { PrismaClient, PrismaPromise } from '@prisma/client';
import { IUser } from '../shared/interfaces/user.interface';

export async function checkPermission(
  prisma: PrismaClient,
  user: IUser,
  resourceId: string,
  resourceType: string,
  permissionType: string
): Promise<boolean> {
  const { uuid, roles, anonymous } = user;
  const result = await prisma.$queryRaw`
    SELECT EXISTS (
      SELECT 1 FROM Ownership
      WHERE resourceId = ${resourceId}
        AND resourceType = ${resourceType}
        AND ownerId = ${uuid}
    )
    OR EXISTS (
      SELECT 1 FROM Permission
      WHERE (
        resourceId = ${resourceId}
        AND resourceType = ${resourceType}
        AND permissionType = ${permissionType}
        AND (
          JSON_VALUE(allowed, '$.anonymous') = 'true' AND ${anonymous}
          OR JSON_CONTAINS(JSON_VALUE(allowed, '$.userIds'), ${uuid})
          OR JSON_OVERLAPS(JSON_VALUE(allowed, '$.roles'), ${roles})
        )
      )
    )`;
  return result as boolean;
}

export async function createPermission(
  prisma: PrismaClient,
  userId: string,
  resourceId: string,
  resourceType: string,
  publicPermission: boolean,
  permissionType: string,
  ownerId: string,
  allowed: any
): Promise<string> {
  const existingPermission = await prisma.permission.findFirst({
    where: {
      userId,
      resourceId,
      resourceType,
      permissionType
    },
  });

  if (existingPermission) {
    return 'Permission already exists';
  }

  await prisma.permission.create({
    data: {
      userId,
      resourceId,
      resourceType,
      publicState: publicPermission,
      permissionType,
      ownerId,
      allowed
    },
  });

  return 'Permission created successfully';
}

export async function removePermission(
  prisma: PrismaClient,
  userId: string,
  resourceId: string,
  resourceType: string,
  permissionType: string
): Promise<void> {
  const existingPermission = await prisma.permission.findFirst({
    where: {
      userId,
      resourceId,
      resourceType,
      permissionType,
    },
  });

  if (!existingPermission) {
    throw new Error("Permission doesn't exist");
  }

  await prisma.permission.deleteMany({
    where: {
      userId,
      resourceId,
      resourceType,
      permissionType,
    },
  });
}

export async function isOwner(
  prisma: PrismaClient,
  ownerId: string,
  resourceId: string,
  resourceType: string
): Promise<boolean> {
  const result = await prisma.ownership.findFirst({
    where: {
      ownerId,
      resourceId,
      resourceType,
    },
  });

  return !!result;
}

export async function getResourceWithPermissionOrOwner(
  prisma: PrismaClient,
  user: IUser,
  permissionType: string,
  resourceType: string
): Promise<string[]> {
  const { uuid, roles } = user;
  const resources: any = await prisma.$queryRaw<PrismaPromise<unknown>>`
      SELECT resourceId
      FROM Ownership
      WHERE resourceType = ${resourceType}
        AND ownerId = ${uuid}
      UNION
      SELECT resourceId
      FROM Permission
      WHERE resourceType = ${resourceType}
        AND (
          permissionType = ${permissionType}
          OR (permissionType = ${permissionType} AND JSON_OVERLAPS(JSON_VALUE(allowed, '$.roles'), ${roles}))
        )`;
  return resources.map((r: { resourceId: string }) => r.resourceId);
}

export async function hasEditPermission(
  prisma: PrismaClient,
  userId: string,
  resourceId: string,
  resourceType: string,
  permissionType: string
): Promise<boolean> {
  const result = await prisma.permission.findFirst({
    where: {
      userId,
      resourceId,
      resourceType,
      permissionType,
    },
  });

  return !!result;
}

export async function addOwner(
  prisma: PrismaClient,
  ownerId: string,
  resourceId: string,
  resourceType: string
): Promise<void> {
  const _isOwner: Boolean = await isOwner(prisma, ownerId, resourceId, resourceType);

  if (_isOwner) {
    return;
  }

  await prisma.ownership.create({
    data: {
      ownerId,
      resourceId,
      resourceType,
    },
  });
}