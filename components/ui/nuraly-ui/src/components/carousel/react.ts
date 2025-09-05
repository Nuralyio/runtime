import {createComponent} from '@lit-labs/react';
import * as React from 'react';
import {CarouselComponent} from './carousel.component.js';

export const HyCarousel = createComponent({
  tagName: 'hy-carousel',
  elementClass: CarouselComponent,
  react: React,
  events: {
    slideChange: 'slide-change',
  },
});
