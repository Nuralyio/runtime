import * as React from 'react';
import { createComponent } from '@lit-labs/react';
import { NrLayoutElement } from './layout.component.js';
import { NrHeaderElement } from './header.component.js';
import { NrFooterElement } from './footer.component.js';
import { NrSiderElement } from './sider.component.js';
import { NrContentElement } from './content.component.js';

export const NrLayout = createComponent({
  tagName: 'nr-layout',
  elementClass: NrLayoutElement,
  react: React,
});

export const NrHeader = createComponent({
  tagName: 'nr-header',
  elementClass: NrHeaderElement,
  react: React,
});

export const NrFooter = createComponent({
  tagName: 'nr-footer',
  elementClass: NrFooterElement,
  react: React,
});

export const NrSider = createComponent({
  tagName: 'nr-sider',
  elementClass: NrSiderElement,
  react: React,
  events: {
    onCollapse: 'collapse',
    onBreakpoint: 'breakpoint',
  },
});

export const NrContent = createComponent({
  tagName: 'nr-content',
  elementClass: NrContentElement,
  react: React,
});
