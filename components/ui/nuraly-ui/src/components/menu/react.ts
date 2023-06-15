import {createComponent} from '@lit-labs/react';
import * as React from 'react';
import {HyMenuComponent} from './menu.component';
export const HyDropdown = createComponent({
  tagName: 'hy-menu',
  elementClass: HyMenuComponent,
  react: React,
  events: {},
});
