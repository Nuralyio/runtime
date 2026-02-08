/**
 * Lazy Service Loader
 * Provides on-demand loading of services to reduce initial bundle size
 */

// Cache for loaded services
const serviceCache = new Map<string, unknown>();

/**
 * Lazily load the workflow service
 */
export async function getWorkflowService() {
  if (!serviceCache.has('workflow')) {
    const module = await import('./workflow.service');
    serviceCache.set('workflow', module.workflowService);
  }
  return serviceCache.get('workflow') as typeof import('./workflow.service').workflowService;
}

/**
 * Lazily load the whiteboard service
 */
export async function getWhiteboardService() {
  if (!serviceCache.has('whiteboard')) {
    const module = await import('./whiteboard.service');
    serviceCache.set('whiteboard', module.whiteboardService);
  }
  return serviceCache.get('whiteboard') as typeof import('./whiteboard.service').whiteboardService;
}

/**
 * Lazily load the applications fetch function
 */
export async function getFetchAllApplications() {
  if (!serviceCache.has('fetchAllApplications')) {
    const module = await import('./applications/fetch-all-applications');
    serviceCache.set('fetchAllApplications', module.fetchAllApplications);
  }
  return serviceCache.get('fetchAllApplications') as typeof import('./applications/fetch-all-applications').fetchAllApplications;
}

/**
 * Lazily load the KV store functions
 */
export async function getKvStore() {
  if (!serviceCache.has('kvStore')) {
    const module = await import('./kv/kv.service');
    serviceCache.set('kvStore', module);
  }
  return serviceCache.get('kvStore') as typeof import('./kv/kv.service');
}

/**
 * Lazily load the revision service
 */
export async function getRevisionService() {
  if (!serviceCache.has('revisionService')) {
    const module = await import('./revisions/revision.service');
    serviceCache.set('revisionService', module);
  }
  return serviceCache.get('revisionService') as typeof import('./revisions/revision.service');
}

/**
 * Lazily load the category service
 */
export async function getCategoryService() {
  if (!serviceCache.has('category')) {
    const module = await import('./category.service');
    serviceCache.set('category', module.categoryService);
  }
  return serviceCache.get('category') as typeof import('./category.service').categoryService;
}

/**
 * Check if a service is already loaded
 */
export function isServiceLoaded(serviceName: string): boolean {
  return serviceCache.has(serviceName);
}

/**
 * Clear the service cache (useful for testing)
 */
export function clearServiceCache(): void {
  serviceCache.clear();
}
