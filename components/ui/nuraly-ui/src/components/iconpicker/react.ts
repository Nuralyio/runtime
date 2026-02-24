/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import * as React from 'react';
import { createComponent } from '@lit-labs/react';
import { NrIconPickerElement } from './icon-picker.component.js';

export const NrIconPicker = createComponent({
  tagName: 'nr-icon-picker',
  elementClass: NrIconPickerElement,
  react: React,
  events: {
    onChange: 'nr-icon-picker-change',
    onOpen: 'nr-icon-picker-open',
    onClose: 'nr-icon-picker-close',
    onSearch: 'nr-icon-picker-search',
    onClear: 'nr-icon-picker-clear',
  },
});
