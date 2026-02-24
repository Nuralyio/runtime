/**
 * Category Service
 * API client for the cross-service category system
 */

import { APIS_URL } from './constants';

export interface Category {
  uuid: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  applicationId: string;
  parentId?: number | null;
  resourceType: string;
  createdBy: string;
  position: number;
  createdAt?: string;
  updatedAt?: string;
  children?: Category[];
  resources?: CategoryResource[];
}

export interface CategoryResource {
  categoryId: number;
  resourceId: string;
  resourceType: string;
  position: number;
  createdAt?: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
}

export const categoryService = {
  async getCategories(applicationId: string, resourceType?: string): Promise<Category[]> {
    const response = await fetch(APIS_URL.getCategories(applicationId, resourceType));
    return handleResponse<Category[]>(response);
  },

  async getCategory(uuid: string): Promise<Category> {
    const response = await fetch(APIS_URL.getCategory(uuid));
    return handleResponse<Category>(response);
  },

  async getCategoryTree(uuid: string): Promise<Category> {
    const response = await fetch(APIS_URL.getCategoryTree(uuid));
    return handleResponse<Category>(response);
  },

  async createCategory(data: {
    name: string;
    applicationId: string;
    resourceType: string;
    description?: string;
    icon?: string;
    color?: string;
    parentUuid?: string;
  }): Promise<Category> {
    const response = await fetch(APIS_URL.createCategory(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Category>(response);
  },

  async updateCategory(uuid: string, data: {
    name?: string;
    description?: string;
    icon?: string;
    color?: string;
    position?: number;
  }): Promise<Category> {
    const response = await fetch(APIS_URL.updateCategory(uuid), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Category>(response);
  },

  async deleteCategory(uuid: string): Promise<Category> {
    const response = await fetch(APIS_URL.deleteCategory(uuid), {
      method: 'DELETE',
    });
    return handleResponse<Category>(response);
  },

  async assignResource(categoryUuid: string, resourceId: string, resourceType: string): Promise<CategoryResource> {
    const response = await fetch(APIS_URL.assignCategoryResource(categoryUuid), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resourceId, resourceType }),
    });
    return handleResponse<CategoryResource>(response);
  },

  async removeResource(categoryUuid: string, resourceId: string, resourceType: string): Promise<void> {
    const response = await fetch(APIS_URL.removeCategoryResource(categoryUuid, resourceId, resourceType), {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
  },

  async getCategoryResources(categoryUuid: string): Promise<CategoryResource[]> {
    const response = await fetch(APIS_URL.getCategoryResources(categoryUuid));
    return handleResponse<CategoryResource[]>(response);
  },

  async findCategoryByResource(resourceType: string, resourceId: string): Promise<Category | null> {
    try {
      const response = await fetch(APIS_URL.findCategoryByResource(resourceType, resourceId));
      if (response.status === 404) return null;
      return handleResponse<Category>(response);
    } catch {
      return null;
    }
  },
};
