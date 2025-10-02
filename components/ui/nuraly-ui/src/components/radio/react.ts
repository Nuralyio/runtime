/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import React from 'react';
import { createComponent } from '@lit-labs/react';
import { NrRadioElement } from './radio.component.js';

export const NrRadio = createComponent({
  tagName: 'nr-radio',
  elementClass: NrRadioElement,
  react: React,
  events: {
    onChange: 'change',
    onFocus: 'focus',
    onBlur: 'blur'
  }
});
