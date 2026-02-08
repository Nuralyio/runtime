export class Category {
    uuid: string;
    name: string;
    description: string | null;
    icon: string | null;
    color: string | null;
    applicationId: string;
    parentId: number | null;
    resourceType: string;
    createdBy: string;
    position: number;
    createdAt?: Date;
    updatedAt?: Date;
    children?: Category[];
    resources?: CategoryResource[];

    constructor(
        uuid: string,
        name: string,
        applicationId: string,
        resourceType: string,
        createdBy: string,
        description: string | null = null,
        icon: string | null = null,
        color: string | null = null,
        parentId: number | null = null,
        position: number = 0,
        createdAt?: Date,
        updatedAt?: Date,
        children?: Category[],
        resources?: CategoryResource[]
    ) {
        this.uuid = uuid;
        this.name = name;
        this.applicationId = applicationId;
        this.resourceType = resourceType;
        this.createdBy = createdBy;
        this.description = description;
        this.icon = icon;
        this.color = color;
        this.parentId = parentId;
        this.position = position;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.children = children;
        this.resources = resources;
    }
}

export class CategoryResource {
    categoryId: number;
    resourceId: string;
    resourceType: string;
    position: number;
    createdAt?: Date;

    constructor(
        categoryId: number,
        resourceId: string,
        resourceType: string,
        position: number = 0,
        createdAt?: Date
    ) {
        this.categoryId = categoryId;
        this.resourceId = resourceId;
        this.resourceType = resourceType;
        this.position = position;
        this.createdAt = createdAt;
    }
}
