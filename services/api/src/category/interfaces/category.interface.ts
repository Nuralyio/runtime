import { Category, CategoryResource } from '../models/category';

export interface CreateCategoryDto {
    name: string;
    applicationId: string;
    resourceType: string;
    description?: string;
    icon?: string;
    color?: string;
    parentUuid?: string;
}

export interface UpdateCategoryDto {
    name?: string;
    description?: string;
    icon?: string;
    color?: string;
    position?: number;
}

export interface AssignResourceDto {
    resourceId: string;
    resourceType: string;
}

export interface BulkAssignResourcesDto {
    resources: AssignResourceDto[];
}

export interface MoveCategoryDto {
    parentUuid: string | null;
}

export interface ICategoryRepository {
    create(category: Category): Promise<Category>;
    findByUuid(uuid: string): Promise<Category | null>;
    findByApplication(applicationId: string, resourceType?: string, parentId?: number | null): Promise<Category[]>;
    findChildren(categoryId: number): Promise<Category[]>;
    findTree(categoryId: number): Promise<Category>;
    update(uuid: string, data: Partial<Category>): Promise<Category>;
    delete(uuid: string): Promise<Category>;
    addResource(categoryId: number, resourceId: string, resourceType: string, position?: number): Promise<CategoryResource>;
    removeResource(resourceId: string, resourceType: string): Promise<void>;
    findResourcesByCategory(categoryId: number): Promise<CategoryResource[]>;
    findCategoryByResource(resourceId: string, resourceType: string): Promise<Category | null>;
    bulkAddResources(categoryId: number, resources: AssignResourceDto[]): Promise<CategoryResource[]>;
    moveCategory(uuid: string, newParentId: number | null): Promise<Category>;
}
