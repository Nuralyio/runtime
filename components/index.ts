/**
 * Components Module
 * UI and runtime components for the Nuraly system
 */

// This module aggregates all component registrations and exports
// Note: Component library is large and primarily used for registration
// Import specific components as needed from ./ui/components/

// CRITICAL: Register all components first (must happen before any component usage)
import '../utils/register-components';

export { BaseElementBlock } from './ui/components/base/BaseElement';
