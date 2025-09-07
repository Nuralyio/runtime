import { createComponent } from '@lit-labs/react';
import * as React from 'react';

export const HyConsole = createComponent({
  tagName: 'hy-console',
  elementClass: class extends HTMLElement {},
  react: React,
  events: {
    command: 'command',
    output: 'output',
  },
});
