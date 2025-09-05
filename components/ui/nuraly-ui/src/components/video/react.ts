import {createComponent} from '@lit-labs/react';
import * as React from 'react';

export const HyVideo = createComponent({
  tagName: 'hy-video',
  elementClass: class extends HTMLElement {},
  react: React,
  events: {
    play: 'play',
    pause: 'pause',
    ended: 'ended',
  },
});
