/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import React from 'react';
import { createComponent } from '@lit-labs/react';
import { HyDatePickerElement } from './datepicker.component.js';

export const HyDatepicker = createComponent({
  tagName: 'hy-datepicker',
  elementClass: HyDatePickerElement,
  react: React,
  events: {
    onDateChange: 'nr-date-change',
    onRangeChange: 'nr-range-change',
    onCalendarOpen: 'nr-calendar-open',
    onCalendarClose: 'nr-calendar-close',
    onFocus: 'nr-focus',
    onBlur: 'nr-blur',
    onValidation: 'nr-validation',
  },
});
