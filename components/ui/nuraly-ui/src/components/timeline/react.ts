import { createComponent } from '@lit-labs/react';
import * as React from 'react';
import { NrTimelineElement } from './timeline.component.js';
export const NrTimeline = createComponent({
  tagName: 'nr-timeline',
  elementClass: NrTimelineElement,
  react: React,
  events: {},
});
