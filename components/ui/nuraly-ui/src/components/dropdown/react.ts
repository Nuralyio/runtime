import { createComponent } from '@lit-labs/react';
import * as React from 'react';
import { NrDropdownElement } from './dropdown.component.js';

export const NrDropdown = createComponent({
  tagName: 'nr-dropdown',
  elementClass: NrDropdownElement,
  react: React,
  events: {
    'nr-dropdown-open': 'onDropdownOpen',
    'nr-dropdown-close': 'onDropdownClose',
    'nr-dropdown-item-click': 'onDropdownItemClick'
  },
});
