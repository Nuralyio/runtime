import { createComponent } from '@lit-labs/react';
import * as React from 'react';
import { NrVideoElement } from './video.component.js';

export const NrVideo = createComponent({
  tagName: 'nr-video',
  elementClass: NrVideoElement,
  react: React,
  events: {
    onPlay: 'nr-video-play',
    onPause: 'nr-video-pause',
    onEnded: 'nr-video-ended',
    onError: 'nr-video-error',
    onPreviewOpen: 'nr-video-preview-open',
    onPreviewClose: 'nr-video-preview-close',
  },
});
