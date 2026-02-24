import { createComponent } from '@lit-labs/react';
import * as React from 'react';
import { NrBadgeElement } from './badge.component.js';
export const NrBadge = createComponent({
  tagName: 'nr-badge',
  elementClass: NrBadgeElement,
  react: React,
  events: {},
});
