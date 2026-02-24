import { singleton } from 'tsyringe';
import { CategoryRepository } from '../repositories/category.repository';
import { Category, CategoryResource } from '../models/category';
import { CreateCategoryDto, UpdateCategoryDto, AssignResourceDto } from '../interfaces/category.interface';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { BadRequestException } from '../../exceptions/BadRequestException';
import { ConflictException } from '../../exceptions/ConflictException';
import { v4 as uuidv4 } from 'uuid';

@singleton()
export class CategoryService {

    constructor(
        private readonly categoryRepository: CategoryRepository
    ) {}

    public async create(dto: CreateCategoryDto, createdBy: string): Promise<Category> {
        let parentInternalId: number | null = null;

        if (dto.parentUuid !== undefined && dto.parentUuid !== null) {
            const resolvedId = await this.categoryRepository.getIdByUuid(dto.parentUuid);
            if (resolvedId === null) {
                throw new NotFoundException('Parent category not found');
            }
            parentInternalId = resolvedId;
        }

        const category = new Category(
            uuidv4(),
            dto.name,
            dto.applicationId,
            dto.resourceType,
            createdBy,
            dto.description ?? null,
            dto.icon ?? null,
            dto.color ?? null,
            parentInternalId,
            0
        );

        return await this.categoryRepository.create(category);
    }

    public async findByUuid(uuid: string): Promise<Category> {
        const category = await this.categoryRepository.findByUuid(uuid);
        if (!category) {
            throw new NotFoundException('Category not found');
        }
        return category;
    }

    public async findByApplication(
        applicationId: string,
        resourceType?: string
    ): Promise<Category[]> {
        // Return root-level categories (parentId = null)
        return await this.categoryRepository.findByApplication(applicationId, resourceType, null);
    }

    public async getTree(uuid: string): Promise<Category> {
        const category = await this.categoryRepository.findByUuid(uuid);
        if (!category) {
            throw new NotFoundException('Category not found');
        }
        const id = await this.categoryRepository.getIdByUuid(uuid);
        if (id === null) {
            throw new NotFoundException('Category not found');
        }
        return await this.categoryRepository.findTree(id);
    }

    public async update(uuid: string, dto: UpdateCategoryDto): Promise<Category> {
        const existing = await this.categoryRepository.findByUuid(uuid);
        if (!existing) {
            throw new NotFoundException('Category not found');
        }

        return await this.categoryRepository.update(uuid, dto);
    }

    public async delete(uuid: string): Promise<Category> {
        const existing = await this.categoryRepository.findByUuid(uuid);
        if (!existing) {
            throw new NotFoundException('Category not found');
        }
        return await this.categoryRepository.delete(uuid);
    }

    public async moveCategory(uuid: string, newParentUuid: string | null): Promise<Category> {
        const existing = await this.categoryRepository.findByUuid(uuid);
        if (!existing) {
            throw new NotFoundException('Category not found');
        }

        const categoryId = await this.categoryRepository.getIdByUuid(uuid);
        if (categoryId === null) {
            throw new NotFoundException('Category not found');
        }

        let newParentId: number | null = null;
        if (newParentUuid !== null) {
            const resolvedId = await this.categoryRepository.getIdByUuid(newParentUuid);
            if (resolvedId === null) {
                throw new NotFoundException('Parent category not found');
            }
            newParentId = resolvedId;

            if (newParentId === categoryId) {
                throw new BadRequestException('A category cannot be its own parent');
            }
            const isDescendant = await this.categoryRepository.isDescendant(newParentId, categoryId);
            if (isDescendant) {
                throw new BadRequestException('Cannot move category into one of its own descendants');
            }
        }

        return await this.categoryRepository.moveCategory(uuid, newParentId);
    }

    public async getResources(uuid: string): Promise<CategoryResource[]> {
        const category = await this.categoryRepository.findByUuid(uuid);
        if (!category) {
            throw new NotFoundException('Category not found');
        }
        const id = await this.categoryRepository.getIdByUuid(uuid);
        if (id === null) {
            throw new NotFoundException('Category not found');
        }
        return await this.categoryRepository.findResourcesByCategory(id);
    }

    public async assignResource(uuid: string, resourceId: string, resourceType: string): Promise<CategoryResource> {
        const category = await this.categoryRepository.findByUuid(uuid);
        if (!category) {
            throw new NotFoundException('Category not found');
        }
        const id = await this.categoryRepository.getIdByUuid(uuid);
        if (id === null) {
            throw new NotFoundException('Category not found');
        }
        return await this.categoryRepository.addResource(id, resourceId, resourceType);
    }

    public async bulkAssignResources(uuid: string, resources: AssignResourceDto[]): Promise<CategoryResource[]> {
        const category = await this.categoryRepository.findByUuid(uuid);
        if (!category) {
            throw new NotFoundException('Category not found');
        }
        const id = await this.categoryRepository.getIdByUuid(uuid);
        if (id === null) {
            throw new NotFoundException('Category not found');
        }
        return await this.categoryRepository.bulkAddResources(id, resources);
    }

    public async removeResource(resourceId: string, resourceType: string): Promise<void> {
        await this.categoryRepository.removeResource(resourceId, resourceType);
    }

    public async findCategoryByResource(resourceId: string, resourceType: string): Promise<Category> {
        const category = await this.categoryRepository.findCategoryByResource(resourceId, resourceType);
        if (!category) {
            throw new NotFoundException('No category found for this resource');
        }
        return category;
    }

    /**
     * Get the applicationId for a category by UUID.
     * Used for authorization checks in the controller.
     */
    public async getApplicationId(uuid: string): Promise<string> {
        const category = await this.categoryRepository.findByUuid(uuid);
        if (!category) {
            throw new NotFoundException('Category not found');
        }
        return category.applicationId;
    }
}
