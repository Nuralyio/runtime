import {createComponent} from '@lit-labs/react';
import * as React from 'react';
import {TabsComponent} from './tabs.component';
export const HyTabsComponent = createComponent({
  tagName: 'hy-tabs',
  elementClass: TabsComponent,
  react: React,
  events: {
    removeTab: 'removeTab',
    tabEdited: 'tabEdited',
    tabTilteClick: 'tabTilteClick',
    tabOrderChange: 'tabOrderChange',
  },
});
