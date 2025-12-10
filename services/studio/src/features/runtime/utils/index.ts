/**
 * Utility Functions - Helper Methods
 * Common utilities for runtime operations
 */

// Change Detection Setup (must be called after eventDispatcher is initialized)
import { setupChangeDetection } from '../components/ui/components/base/BaseElement/base-change-detection';

// Component Rendering
export { renderComponent } from './render-util';

// Logging
export { log as Logger, setLogLevel, enableLogging, enableBenchmarking, LOG_LEVELS } from './logger';

// Change Detection
export { eventDispatcher } from './change-detection';

// Initialize change detection after eventDispatcher is loaded
setupChangeDetection();

// Clipboard Utilities
export { 
  copyCpmponentToClipboard, 
  pasteComponentFromClipboard, 
  traitCompoentFromSchema,
  generateNuralyClipboardStructure 
} from './clipboard-utils';

// Runtime Helpers
export { RuntimeHelpers } from './runtime-helpers';
export { RuntimeContextHelpers } from './RuntimeContextHelpers';

// Validation
export { validateHandlerCode, validateComponentHandlers } from './handler-validator';
export { 
  isForbiddenGlobal, 
  isForbiddenProperty, 
  isAllowedGlobal, 
  isForbiddenFunction,
  getErrorMessage,
  FORBIDDEN_GLOBALS,
  FORBIDDEN_PROPERTIES,
  FORBIDDEN_FUNCTIONS,
  VALIDATION_ERROR_MESSAGES
} from './handler-security-rules';
export { formatValidationErrors } from './validation-error-formatter';

// Storage
export { LocalStorage } from './local-storage';

// Object Utilities
export { getNestedAttribute, hasOnlyEmptyObjects } from './object.utils';

// API Utilities
export { processHeaders } from './api-calls-utils';

// Style Utilities

// Time/Performance Utilities
export { debounce } from './performance-utils';

// Naming Utilities
export { GenerateName } from './naming-generator';

// Constants
export * from './constants';
