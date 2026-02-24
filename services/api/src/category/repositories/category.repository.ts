import prisma from '../../../prisma/prisma';
import { singleton } from 'tsyringe';
import { ICategoryRepository, AssignResourceDto } from '../interfaces/category.interface';
import { Category, CategoryResource } from '../models/category';
import { NotFoundException } from '../../exceptions/NotFoundException';

function mapToCategory(row: any): Category {
    return new Category(
        row.uuid,
        row.name,
        row.applicationId,
        row.resourceType,
        row.createdBy,
        row.description,
        row.icon,
        row.color,
        row.parentId,
        row.position,
        row.createdAt,
        row.updatedAt,
        row.children?.map(mapToCategory),
        row.resources?.map(mapToResource)
    );
}

function mapToResource(row: any): CategoryResource {
    return new CategoryResource(
        row.categoryId,
        row.resourceId,
        row.resourceType,
        row.position,
        row.createdAt
    );
}

@singleton()
export class CategoryRepository implements ICategoryRepository {

    public async create(category: Category): Promise<Category> {
        const created = await prisma.category.create({
            data: {
                uuid: category.uuid,
                name: category.name,
                description: category.description,
                icon: category.icon,
                color: category.color,
                applicationId: category.applicationId,
                parentId: category.parentId,
                resourceType: category.resourceType,
                createdBy: category.createdBy,
                position: category.position,
            },
        });
        return mapToCategory(created);
    }

    public async findByUuid(uuid: string): Promise<Category | null> {
        const category = await prisma.category.findUnique({
            where: { uuid },
            include: {
                children: true,
                resources: true,
            },
        });
        if (!category) return null;
        return mapToCategory(category);
    }

    public async findByApplication(
        applicationId: string,
        resourceType?: string,
        parentId?: number | null
    ): Promise<Category[]> {
        const where: any = { applicationId };

        if (resourceType) {
            where.resourceType = resourceType;
        }

        // If parentId is explicitly passed (including null for root), filter by it
        if (parentId !== undefined) {
            where.parentId = parentId;
        }

        const categories = await prisma.category.findMany({
            where,
            include: {
                children: true,
                resources: true,
            },
            orderBy: { position: 'asc' },
        });
        return categories.map(mapToCategory);
    }

    public async findChildren(categoryId: number): Promise<Category[]> {
        const children = await prisma.category.findMany({
            where: { parentId: categoryId },
            include: {
                children: true,
                resources: true,
            },
            orderBy: { position: 'asc' },
        });
        return children.map(mapToCategory);
    }

    public async findTree(categoryId: number): Promise<Category> {
        // Recursive tree building using iterative Prisma queries
        const root = await prisma.category.findUnique({
            where: { id: categoryId },
            include: { resources: true },
        });

        if (!root) {
            throw new NotFoundException('Category not found');
        }

        const rootCategory = mapToCategory(root);
        await this.loadChildrenRecursive(rootCategory, categoryId);
        return rootCategory;
    }

    private async loadChildrenRecursive(parent: Category, parentId: number): Promise<void> {
        const children = await prisma.category.findMany({
            where: { parentId },
            include: { resources: true },
            orderBy: { position: 'asc' },
        });

        parent.children = children.map(mapToCategory);

        for (const child of parent.children) {
            // Find the internal id for this child to query its children
            const childRecord = children.find(c => c.uuid === child.uuid);
            if (childRecord) {
                await this.loadChildrenRecursive(child, childRecord.id);
            }
        }
    }

    public async update(uuid: string, data: Partial<Category>): Promise<Category> {
        const updateData: any = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.icon !== undefined) updateData.icon = data.icon;
        if (data.color !== undefined) updateData.color = data.color;
        if (data.position !== undefined) updateData.position = data.position;
        if (data.parentId !== undefined) updateData.parentId = data.parentId;

        const updated = await prisma.category.update({
            where: { uuid },
            data: updateData,
            include: {
                children: true,
                resources: true,
            },
        });
        return mapToCategory(updated);
    }

    public async delete(uuid: string): Promise<Category> {
        const deleted = await prisma.category.delete({
            where: { uuid },
        });
        return mapToCategory(deleted);
    }

    public async addResource(
        categoryId: number,
        resourceId: string,
        resourceType: string,
        position: number = 0
    ): Promise<CategoryResource> {
        // Upsert: if resource already categorized, move it to this category
        const result = await prisma.categoryResource.upsert({
            where: {
                resourceId_resourceType: { resourceId, resourceType },
            },
            update: {
                categoryId,
                position,
            },
            create: {
                categoryId,
                resourceId,
                resourceType,
                position,
            },
        });
        return mapToResource(result);
    }

    public async removeResource(resourceId: string, resourceType: string): Promise<void> {
        await prisma.categoryResource.deleteMany({
            where: { resourceId, resourceType },
        });
    }

    public async findResourcesByCategory(categoryId: number): Promise<CategoryResource[]> {
        const resources = await prisma.categoryResource.findMany({
            where: { categoryId },
            orderBy: { position: 'asc' },
        });
        return resources.map(mapToResource);
    }

    public async findCategoryByResource(resourceId: string, resourceType: string): Promise<Category | null> {
        const resource = await prisma.categoryResource.findUnique({
            where: {
                resourceId_resourceType: { resourceId, resourceType },
            },
            include: {
                category: true,
            },
        });
        if (!resource) return null;
        return mapToCategory(resource.category);
    }

    public async bulkAddResources(categoryId: number, resources: AssignResourceDto[]): Promise<CategoryResource[]> {
        const results: CategoryResource[] = [];
        for (const resource of resources) {
            const result = await this.addResource(categoryId, resource.resourceId, resource.resourceType);
            results.push(result);
        }
        return results;
    }

    public async moveCategory(uuid: string, newParentId: number | null): Promise<Category> {
        const updated = await prisma.category.update({
            where: { uuid },
            data: { parentId: newParentId },
            include: {
                children: true,
                resources: true,
            },
        });
        return mapToCategory(updated);
    }

    /**
     * Get the internal ID for a category by UUID.
     * Used internally for parent references.
     */
    public async getIdByUuid(uuid: string): Promise<number | null> {
        const category = await prisma.category.findUnique({
            where: { uuid },
            select: { id: true },
        });
        return category?.id ?? null;
    }

    /**
     * Check if a category is a descendant of another category.
     * Used to prevent circular references.
     */
    public async isDescendant(categoryId: number, potentialAncestorId: number): Promise<boolean> {
        let currentId: number | null = categoryId;
        const visited = new Set<number>();

        while (currentId !== null) {
            if (currentId === potentialAncestorId) return true;
            if (visited.has(currentId)) return false; // safety: break cycles
            visited.add(currentId);

            const found: { parentId: number | null } | null = await prisma.category.findUnique({
                where: { id: currentId },
                select: { parentId: true },
            });
            currentId = found?.parentId ?? null;
        }
        return false;
    }
}
