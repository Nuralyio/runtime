/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import React from 'react';
import { createComponent } from '@lit-labs/react';
import { HyRadioComponent } from './radio.component.js';

export const HyRadio = createComponent({
  tagName: 'hy-radio-input',
  elementClass: HyRadioComponent,
  react: React,
  events: {
    onChanged: 'change'
  }
});
