/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, nothing } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import { classMap } from 'lit/directives/class-map.js';
import type { CollaborationUser } from '../interfaces/collaboration.interface.js';

export interface PresenceBarTemplateData {
  users: CollaborationUser[];
  connected: boolean;
  onUserClick?: (userId: string) => void;
}

/**
 * Renders a presence bar showing connected users as colored avatar
 * circles with initials, positioned in the top-right of the canvas.
 */
export function renderPresenceBarTemplate(data: PresenceBarTemplateData) {
  const { users, connected, onUserClick } = data;

  if (!connected && users.length === 0) return nothing;

  const getInitials = (username: string): string => {
    const parts = username.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return username.slice(0, 2).toUpperCase();
  };

  const maxVisible = 5;
  const visibleUsers = users.slice(0, maxVisible);
  const extraCount = Math.max(0, users.length - maxVisible);

  return html`
    <div class="presence-bar">
      <div class="presence-avatars">
        ${visibleUsers.map(user => html`
          <div
            class=${classMap({
              'presence-avatar': true,
              'presence-avatar-typing': !!user.isTyping,
              'presence-avatar-clickable': !!onUserClick,
            })}
            style=${styleMap({ background: user.color })}
            title="${onUserClick
              ? `Click to go to ${user.username}${user.isTyping ? ' (typing...)' : ''}`
              : `${user.username}${user.isTyping ? ' (typing...)' : ''}`}"
            @click=${onUserClick ? () => onUserClick(user.userId) : nothing}
          >
            ${getInitials(user.username)}
          </div>
        `)}
        ${extraCount > 0 ? html`
          <div class="presence-avatar presence-avatar-extra" title="${extraCount} more users">
            +${extraCount}
          </div>
        ` : nothing}
      </div>
      <span class="presence-count">
        ${connected
          ? `${users.length} online`
          : 'Reconnecting...'}
      </span>
    </div>
  `;
}
