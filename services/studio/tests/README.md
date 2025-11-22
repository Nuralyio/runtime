# Testing Infrastructure

This directory contains all tests for the Nuraly application.

## Structure

```
tests/
├── unit/                  # Unit tests for individual functions/modules
│   ├── runtime/          # Runtime system tests
│   ├── utils/            # Utility function tests
│   ├── processors/       # Processor and generator tests
│   └── redux/            # State management tests
│
├── integration/          # Integration tests for feature workflows
│   ├── runtime/          # Runtime execution flow tests
│   └── services/         # API service tests
│
├── component/            # Component tests
│   ├── base/            # BaseElement tests
│   ├── inputs/          # Input component tests
│   └── advanced/        # Advanced component tests
│
├── e2e/                 # End-to-end tests
│   ├── studio/          # Studio editor tests
│   └── runtime/         # Application runtime tests
│
├── fixtures/            # Test data and fixtures
│   ├── components.ts    # Component fixtures
│   ├── pages.ts         # Page fixtures
│   └── handlers.ts      # Handler code fixtures
│
├── helpers/             # Test utilities
│   ├── test-utils.ts    # Common test utilities
│   ├── mock-runtime.ts  # Runtime mocking utilities
│   └── mock-api.ts      # API mocking utilities
│
├── setup.ts             # Global test setup
└── README.md           # This file
```

## Running Tests

### Unit & Integration Tests (Vitest)

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- runtime/compiler.test.ts

# Run tests matching pattern
npm test -- --grep "handler execution"
```

### E2E Tests (Playwright)

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in specific browser
npm run test:e2e -- --project=chromium

# Debug E2E tests
npm run test:e2e -- --debug
```

### Run All Tests

```bash
npm run test:all
```

## Writing Tests

### Unit Tests

```typescript
import { describe, it, expect, vi } from 'vitest';
import { myFunction } from '@/path/to/module';

describe('myFunction', () => {
  it('should do something', () => {
    const result = myFunction('input');
    expect(result).toBe('expected output');
  });

  it('should handle edge cases', () => {
    expect(() => myFunction(null)).toThrow();
  });
});
```

### Component Tests

```typescript
import { describe, it, expect } from 'vitest';
import { fixture, html } from '@testing-library/lit';
import '../src/shared/ui/components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', async () => {
    const el = await fixture(html`<my-component></my-component>`);
    expect(el).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const el = await fixture(html`<my-component></my-component>`);
    const button = el.shadowRoot?.querySelector('button');
    button?.click();
    // Assert expected behavior
  });
});
```

### E2E Tests

```typescript
import { test, expect } from '@playwright/test';

test('user can create a component', async ({ page }) => {
  await page.goto('/app/studio');

  // Drag component from library
  await page.dragAndDrop('.component-library .button', '.canvas');

  // Verify component appears
  await expect(page.locator('.canvas .button')).toBeVisible();
});
```

## Test Utilities

### Mock Runtime

```typescript
import { createMockExecuteInstance, createMockHandlerContext } from '@tests/helpers/mock-runtime';

const executeInstance = createMockExecuteInstance();
const context = createMockHandlerContext();
```

### Mock API

```typescript
import { mockApiSuccess, mockApiError } from '@tests/helpers/mock-api';

// Mock successful API response
mockApiSuccess('/api/applications', { id: '1', name: 'Test App' });

// Mock error response
mockApiError('/api/applications', 'Not found', 404);
```

### Test Fixtures

```typescript
import { mockButtonComponent, mockContainerComponent } from '@tests/fixtures/components';
import { mockHomePage } from '@tests/fixtures/pages';
import { validHandlers } from '@tests/fixtures/handlers';

// Use in tests
const component = mockButtonComponent;
const page = mockHomePage;
const handler = validHandlers.setVariable;
```

## Coverage Goals

- **Unit Tests:** 90%+ coverage
- **Integration Tests:** All critical paths
- **Component Tests:** BaseElement + 20 most-used components
- **E2E Tests:** 10-15 critical workflows
- **Overall:** 80%+ code coverage

## Best Practices

1. **Test behavior, not implementation**
   - Focus on what the code does, not how it does it
   - Avoid testing internal details

2. **Keep tests simple and focused**
   - One assertion per test when possible
   - Clear test names describing what is being tested

3. **Use fixtures for common data**
   - Don't repeat test data
   - Create reusable fixtures

4. **Mock external dependencies**
   - Mock API calls, browser APIs, external services
   - Use provided mock utilities

5. **Test edge cases**
   - Null/undefined values
   - Empty arrays/objects
   - Error conditions

6. **Cleanup after tests**
   - Reset mocks
   - Clear state
   - Remove DOM elements

## Continuous Integration

Tests run automatically on:
- Every push to feature branches
- Pull requests to main
- Before merging to main

CI will fail if:
- Any test fails
- Coverage drops below threshold
- E2E tests fail

## Debugging Tests

### Vitest

```bash
# Run with Node debugger
node --inspect-brk node_modules/.bin/vitest

# Use console.log in tests
it('debug test', () => {
  console.log('Debug info:', someValue);
  expect(someValue).toBe('expected');
});
```

### Playwright

```bash
# Run with UI mode for debugging
npm run test:e2e:ui

# Run with headed browser
npm run test:e2e -- --headed

# Pause execution
await page.pause();
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)
- [MSW Documentation](https://mswjs.io/)
