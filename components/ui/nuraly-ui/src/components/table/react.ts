import { createComponent } from '@lit-labs/react';
import * as React from 'react';
import { HyTable } from './table.component.js';

export const HyTableComponent = createComponent({
  tagName: 'nr-table',
  elementClass: HyTable,
  react: React,
  events: {
    rowClick: 'row-click',
    sortChange: 'sort-change',
    selectionChange: 'selection-change',
  },
});
