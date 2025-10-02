/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import React from 'react';
import { createComponent } from '@lit-labs/react';
import { NrRadioGroupElement } from './radio-group.component.js';

export const NrRadioGroup = createComponent({
  tagName: 'nr-radio-group',
  elementClass: NrRadioGroupElement,
  react: React,
  events: {
    onChanged: 'nr-change'
  }
});
