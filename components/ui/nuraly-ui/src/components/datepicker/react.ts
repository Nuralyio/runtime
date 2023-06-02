import {createComponent} from '@lit-labs/react';
import * as React from 'react';
import {HyDatePickerElement} from './date-picker.component';
export const HyDatepicker = createComponent({
  tagName: 'hy-datepicker',
  elementClass: HyDatePickerElement,
  react: React,
  events: {},
});
