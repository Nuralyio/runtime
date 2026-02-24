import { vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

/**
 * Mock API utilities for testing API services
 */

/**
 * Create a mock fetch response
 */
export function createMockResponse(data: any, options: any = {}) {
  return {
    ok: options.ok ?? true,
    status: options.status ?? 200,
    statusText: options.statusText ?? 'OK',
    json: vi.fn().mockResolvedValue(data),
    text: vi.fn().mockResolvedValue(JSON.stringify(data)),
    headers: new Headers(options.headers || {}),
    ...options,
  };
}

/**
 * Create a mock error response
 */
export function createMockErrorResponse(
  message: string,
  status = 500,
  statusText = 'Internal Server Error'
) {
  return {
    ok: false,
    status,
    statusText,
    json: vi.fn().mockResolvedValue({ error: message }),
    text: vi.fn().mockResolvedValue(JSON.stringify({ error: message })),
    headers: new Headers(),
  };
}

/**
 * Mock API endpoints using MSW
 */
export const apiHandlers = [
  // Applications
  http.get('/api/applications', () => {
    return HttpResponse.json([]);
  }),

  http.get('/api/applications/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      name: 'Test Application',
      pages: [],
    });
  }),

  http.post('/api/applications', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 'new-app-id',
      ...body,
    });
  }),

  http.put('/api/applications/:id', async ({ params, request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: params.id,
      ...body,
    });
  }),

  http.delete('/api/applications/:id', () => {
    return HttpResponse.json({ success: true });
  }),

  // Pages
  http.get('/api/pages', () => {
    return HttpResponse.json([]);
  }),

  http.get('/api/pages/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      name: 'Test Page',
      components: [],
    });
  }),

  http.post('/api/pages', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 'new-page-id',
      ...body,
    });
  }),

  http.put('/api/pages/:id', async ({ params, request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: params.id,
      ...body,
    });
  }),

  http.delete('/api/pages/:id', () => {
    return HttpResponse.json({ success: true });
  }),

  // Components
  http.get('/api/components', () => {
    return HttpResponse.json([]);
  }),

  http.get('/api/components/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      type: 'Container',
      properties: {},
    });
  }),

  http.post('/api/components', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 'new-component-id',
      ...body,
    });
  }),

  http.put('/api/components/:id', async ({ params, request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: params.id,
      ...body,
    });
  }),

  http.delete('/api/components/:id', () => {
    return HttpResponse.json({ success: true });
  }),

  // Backend functions
  http.post('/api/functions/:name', async ({ params, request }) => {
    const body = await request.json();
    return HttpResponse.json({
      result: 'success',
      data: body,
    });
  }),

  // File upload
  http.post('/api/files/upload', async ({ request }) => {
    return HttpResponse.json({
      url: 'https://example.com/uploaded-file.jpg',
      filename: 'uploaded-file.jpg',
    });
  }),
];

/**
 * Create MSW server for testing
 */
export const server = setupServer(...apiHandlers);

/**
 * Setup MSW for tests
 */
export function setupMSW() {
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
}

/**
 * Mock successful API call
 */
export function mockApiSuccess(endpoint: string, data: any) {
  global.fetch = vi.fn().mockResolvedValue(createMockResponse(data));
}

/**
 * Mock failed API call
 */
export function mockApiError(endpoint: string, message: string, status = 500) {
  global.fetch = vi.fn().mockResolvedValue(createMockErrorResponse(message, status));
}

/**
 * Reset fetch mock
 */
export function resetFetchMock() {
  if (global.fetch && 'mockReset' in global.fetch) {
    (global.fetch as any).mockReset();
  }
}
