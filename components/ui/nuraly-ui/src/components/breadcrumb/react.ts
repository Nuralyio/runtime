import { createComponent } from '@lit-labs/react';
import * as React from 'react';
import { NrBreadcrumbElement } from './breadcrumb.component.js';
export const NrBreadcrumb = createComponent({
  tagName: 'nr-breadcrumb',
  elementClass: NrBreadcrumbElement,
  react: React,
  events: {
    onBreadcrumbClick: 'nr-breadcrumb-click',
  },
});
