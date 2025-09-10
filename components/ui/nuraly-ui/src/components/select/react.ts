import React from 'react';
import { createComponent } from '@lit-labs/react';
import { HySelectComponent } from './select.component.js';

/**
 * React wrapper for the HySelectComponent
 * Provides React-compatible props and event handling
 */
export const HySelect = createComponent({
  tagName: 'hy-select',
  elementClass: HySelectComponent,
  react: React,
  events: {
    // Standard events
    onChange: 'change',
    onChanged: 'changed', // Legacy event for backward compatibility
    onFocus: 'focus',
    onBlur: 'blur',
    
    // Select-specific events
    onDropdownOpen: 'dropdown-open',
    onDropdownClose: 'dropdown-close',
    onValidation: 'validation',
    onSelectError: 'select-error',
    onSelectFocus: 'select-focus',
  },
});

// Export type for React props
export type HySelectProps = React.ComponentProps<typeof HySelect>;