import { createComponent } from '@lit-labs/react';
import * as React from 'react';

export const HyChatbot = createComponent({
  tagName: 'nr-chatbot',
  elementClass: class extends HTMLElement {},
  react: React,
  events: {
    messageSubmit: 'message-submit',
    messageReceive: 'message-receive',
  },
});
