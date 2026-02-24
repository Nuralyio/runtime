/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */
import { createComponent } from '@lit-labs/react';
import * as React from 'react';
import { NrAlertElement } from './alert.component.js';

export const NrAlert = createComponent({
  tagName: 'nr-alert',
  elementClass: NrAlertElement,
  react: React,
  events: {
    'nr-alert-close': 'nr-alert-close',
  },
});
