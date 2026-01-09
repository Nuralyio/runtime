/**
 * @fileoverview SSR Context Factory
 * @module Runtime/SSR/CreateSSRContext
 *
 * @description
 * Factory function to create request-scoped SSR runtime contexts.
 * Extracts data from the request and initializes an isolated context.
 */

import { SSRRuntimeContext } from './SSRRuntimeContext';
import type { SSRInitialData, SSRUser, SSRApplication } from './types';
import type { ComponentElement } from '../redux/store/component/component.interface';

/**
 * Options for creating SSR context
 */
export interface CreateSSRContextOptions {
  /** Components to render */
  components: ComponentElement[];

  /** Applications */
  applications: SSRApplication[];

  /** Page ID being rendered */
  pageId: string;

  /** User data (from headers/session) */
  user?: SSRUser | null;

  /** URL parameters */
  params?: Record<string, string>;

  /** Query string parameters */
  query?: Record<string, string>;

  /** Initial variable values */
  variables?: Record<string, any>;

  /** Platform override */
  platform?: 'desktop' | 'tablet' | 'mobile';
}

/**
 * Create an SSR runtime context from options
 *
 * @param options - Context creation options
 * @returns SSRRuntimeContext instance
 *
 * @example
 * ```typescript
 * const ctx = createSSRContext({
 *   components: pageComponents,
 *   applications: [{ uuid: 'app-1', name: 'MyApp' }],
 *   pageId: 'home',
 *   user: { id: '123', email: 'user@example.com' },
 *   params: { slug: 'about' },
 *   query: { tab: 'info' },
 * });
 * ```
 */
export function createSSRContext(options: CreateSSRContextOptions): SSRRuntimeContext {
  const {
    components,
    applications,
    pageId,
    user = null,
    params = {},
    query = {},
    variables = {},
    platform = 'desktop',
  } = options;

  // Build initial variables from multiple sources
  const initialVariables: Record<string, any> = {
    // Start with provided variables
    ...variables,

    // Add URL params
    ...params,

    // Add query params
    ...query,

    // Add user-related variables if authenticated
    ...(user ? {
      currentUserId: user.id,
      isLoggedIn: true,
    } : {
      isLoggedIn: false,
    }),

    // Add page context
    currentPageId: pageId,
  };

  const initialData: SSRInitialData = {
    components,
    applications,
    variables: initialVariables,
    user,
    pageId,
    platform,
    params,
    query,
  };

  return new SSRRuntimeContext(initialData);
}

/**
 * Create SSR context from Astro request
 *
 * @param request - Astro/Fetch Request object
 * @param options - Additional options
 * @returns SSRRuntimeContext instance
 *
 * @example Astro usage
 * ```typescript
 * // In .astro file
 * const ctx = await createSSRContextFromRequest(Astro.request, {
 *   components: pageComponents,
 *   applications: loadedApps,
 *   pageId: params.pageId,
 * });
 * ```
 */
export async function createSSRContextFromRequest(
  request: Request,
  options: Omit<CreateSSRContextOptions, 'user' | 'params' | 'query' | 'platform'>
): Promise<SSRRuntimeContext> {
  // Extract user from headers (set by gateway/auth middleware)
  const user = extractUserFromRequest(request);

  // Parse URL for params and query
  const url = new URL(request.url);
  const query = Object.fromEntries(url.searchParams);

  // Detect platform from user agent
  const platform = detectPlatform(request);

  return createSSRContext({
    ...options,
    user,
    query,
    platform,
  });
}

/**
 * Extract user data from request headers
 */
export function extractUserFromRequest(request: Request): SSRUser | null {
  // Check for user header (set by auth gateway)
  const userHeader = request.headers.get('X-USER');
  if (userHeader) {
    try {
      return JSON.parse(userHeader);
    } catch {
      // Invalid JSON, ignore
    }
  }

  // Check for individual headers
  const userId = request.headers.get('X-USER-ID');
  if (userId) {
    const email = request.headers.get('X-USER-EMAIL') || undefined;
    const rolesHeader = request.headers.get('X-USER-ROLES');
    const roles = rolesHeader ? rolesHeader.split(',').map(r => r.trim()) : undefined;

    return { id: userId, email, roles };
  }

  return null;
}

/**
 * Detect platform from request user agent
 */
export function detectPlatform(request: Request): 'desktop' | 'tablet' | 'mobile' {
  const userAgent = request.headers.get('User-Agent') || '';
  const ua = userAgent.toLowerCase();

  // Mobile detection
  if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(ua)) {
    return 'mobile';
  }

  // Tablet detection
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    return 'tablet';
  }

  return 'desktop';
}

/**
 * Create a minimal SSR context for testing
 *
 * @param overrides - Optional overrides for testing
 * @returns SSRRuntimeContext instance
 */
export function createTestSSRContext(
  overrides: Partial<SSRInitialData> = {}
): SSRRuntimeContext {
  const defaults: SSRInitialData = {
    components: [],
    applications: [],
    variables: {},
    user: null,
    pageId: 'test-page',
    platform: 'desktop',
    params: {},
    query: {},
  };

  return new SSRRuntimeContext({ ...defaults, ...overrides });
}
