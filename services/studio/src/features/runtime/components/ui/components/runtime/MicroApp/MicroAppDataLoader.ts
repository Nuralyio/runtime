/**
 * @fileoverview MicroApp Data Loader
 * @module MicroApp/DataLoader
 *
 * @description
 * Provides configurable data loading functions for MicroApp component.
 * Users can provide custom loaders or use the default API-based loaders.
 *
 * @example
 * ```typescript
 * // Use default loader (loads from /api/...)
 * <micro-app uuid="123"></micro-app>
 *
 * // Use custom loader
 * <micro-app
 *   uuid="123"
 *   .dataLoader=${myCustomLoader}
 * ></micro-app>
 * ```
 */

import type { ComponentElement } from '../../../../../redux/store/component/component.interface';
import type { PageElement } from '../../../../../redux/store/page/page.interface';

/**
 * Result of loading application components
 */
export interface ComponentsLoadResult {
  /** Array of components */
  components: ComponentElement[];
  /** Optional error message */
  error?: string;
}

/**
 * Result of loading application pages
 */
export interface PagesLoadResult {
  /** Array of pages */
  pages: PageElement[];
  /** Optional error message */
  error?: string;
}

/**
 * Data loader interface for MicroApp
 *
 * Allows users to customize how components and pages are loaded.
 * If not provided, MicroApp uses the default API-based loader.
 */
export interface MicroAppDataLoader {
  /**
   * Load components for an application
   *
   * @param appUuid - Application UUID
   * @returns Promise resolving to components and optional error
   */
  loadComponents: (appUuid: string) => Promise<ComponentsLoadResult>;

  /**
   * Load pages for an application
   *
   * @param appUuid - Application UUID
   * @returns Promise resolving to pages and optional error
   */
  loadPages: (appUuid: string) => Promise<PagesLoadResult>;
}

/**
 * Default data loader implementation
 *
 * Loads components and pages from the standard Nuraly Studio API endpoints:
 * - Components: GET /api/components/application/:uuid
 * - Pages: GET /api/pages/application/:uuid
 */
export const defaultMicroAppDataLoader: MicroAppDataLoader = {
  /**
   * Load components from API
   */
  async loadComponents(appUuid: string): Promise<ComponentsLoadResult> {
    try {
      const response = await fetch(`/api/components/application/${appUuid}`);

      if (!response.ok) {
        return {
          components: [],
          error: `Failed to fetch components: HTTP ${response.status}`
        };
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        return {
          components: [],
          error: 'Invalid components data format: expected array'
        };
      }

      // Extract component objects from wrapper
      const components = data.map((item: any) => item.component);

      return {
        components,
        error: undefined
      };
    } catch (error) {
      return {
        components: [],
        error: `Error fetching components: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  },

  /**
   * Load pages from API
   */
  async loadPages(appUuid: string): Promise<PagesLoadResult> {
    try {
      const response = await fetch(`/api/pages/application/${appUuid}`);

      if (!response.ok) {
        return {
          pages: [],
          error: `Failed to fetch pages: HTTP ${response.status}`
        };
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        return {
          pages: [],
          error: 'Invalid pages data format: expected array'
        };
      }

      if (data.length === 0) {
        console.warn(`No pages found for application ${appUuid}`);
      }

      return {
        pages: data,
        error: undefined
      };
    } catch (error) {
      return {
        pages: [],
        error: `Error fetching pages: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
};

/**
 * Create a custom data loader from external API
 *
 * @example
 * ```typescript
 * const myLoader = createCustomDataLoader({
 *   baseUrl: 'https://my-server.com',
 *   headers: { 'Authorization': 'Bearer token' }
 * });
 * ```
 */
export function createCustomDataLoader(options: {
  baseUrl: string;
  headers?: Record<string, string>;
  componentsEndpoint?: string;
  pagesEndpoint?: string;
}): MicroAppDataLoader {
  const {
    baseUrl,
    headers = {},
    componentsEndpoint = '/components/application',
    pagesEndpoint = '/pages/application'
  } = options;

  return {
    async loadComponents(appUuid: string): Promise<ComponentsLoadResult> {
      try {
        const url = `${baseUrl}${componentsEndpoint}/${appUuid}`;
        const response = await fetch(url, { headers });

        if (!response.ok) {
          return {
            components: [],
            error: `Failed to fetch components: HTTP ${response.status}`
          };
        }

        const components = await response.json();

        if (!Array.isArray(components)) {
          return {
            components: [],
            error: 'Invalid components data format: expected array'
          };
        }

        return { components };
      } catch (error) {
        return {
          components: [],
          error: `Error fetching components: ${error instanceof Error ? error.message : String(error)}`
        };
      }
    },

    async loadPages(appUuid: string): Promise<PagesLoadResult> {
      try {
        const url = `${baseUrl}${pagesEndpoint}/${appUuid}`;
        const response = await fetch(url, { headers });

        if (!response.ok) {
          return {
            pages: [],
            error: `Failed to fetch pages: HTTP ${response.status}`
          };
        }

        const pages = await response.json();

        if (!Array.isArray(pages)) {
          return {
            pages: [],
            error: 'Invalid pages data format: expected array'
          };
        }

        return { pages };
      } catch (error) {
        return {
          pages: [],
          error: `Error fetching pages: ${error instanceof Error ? error.message : String(error)}`
        };
      }
    }
  };
}
