import * as React from 'react';
import { createComponent } from '@lit-labs/react';
import { NrSkeletonElement } from './skeleton.component.js';

export const NrSkeleton = createComponent({
  tagName: 'nr-skeleton',
  elementClass: NrSkeletonElement,
  react: React,
  events: {},
});
