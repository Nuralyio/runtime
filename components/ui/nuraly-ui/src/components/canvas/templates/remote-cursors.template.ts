/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, nothing } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import type { RemoteCursor } from '../interfaces/collaboration.interface.js';
import type { CanvasViewport } from '../interfaces/canvas-host.interface.js';

export interface RemoteCursorsTemplateData {
  cursors: RemoteCursor[];
  viewport: CanvasViewport;
  localUserId?: string;
}

/**
 * Renders remote user cursors on the canvas, transformed from
 * canvas coordinates to screen coordinates using viewport zoom/pan.
 */
export function renderRemoteCursorsTemplate(data: RemoteCursorsTemplateData) {
  const { cursors, viewport, localUserId } = data;

  const visibleCursors = cursors.filter(c => c.userId !== localUserId);
  if (visibleCursors.length === 0) return nothing;

  return visibleCursors.map(cursor => {
    const screenX = cursor.x * viewport.zoom + viewport.panX;
    const screenY = cursor.y * viewport.zoom + viewport.panY;

    const cursorStyles = {
      left: `${screenX}px`,
      top: `${screenY}px`,
    };

    return html`
      <div class="remote-cursor" style=${styleMap(cursorStyles)}>
        <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
          <path
            d="M1 1L6 18L8.5 10.5L15 8.5L1 1Z"
            fill="${cursor.color}"
            stroke="white"
            stroke-width="1.5"
            stroke-linejoin="round"
          />
        </svg>
        <span
          class="remote-cursor-label"
          style="background: ${cursor.color};"
        >${cursor.username}</span>
      </div>
    `;
  });
}
