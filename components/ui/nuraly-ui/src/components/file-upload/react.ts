import {createComponent} from '@lit-labs/react';
import * as React from 'react';
import {FileUpload} from './file-upload.component.js';

export const HyFileUpload = createComponent({
  tagName: 'nr-file-upload',
  elementClass: FileUpload,
  react: React,
  events: {
    fileChange: 'file-change',
    uploadComplete: 'upload-complete',
    uploadError: 'upload-error',
  },
});
