/**
 * PresenceIndicator Component
 * Shows connected users in the application toolbar - styled like collaborative tools (Figma/TLDraw)
 */

import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { StoreController } from '@nanostores/lit';
import { $otherPresenceUsers, $presenceConnected, $presenceUsers } from './presence-store';
import type { PresenceUser } from './presence-types';

@customElement('presence-indicator')
export class PresenceIndicator extends LitElement {
  static styles = css`
    :host {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .presence-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 8px;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 20px;
      border: 1px solid rgba(0, 0, 0, 0.08);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }

    .avatars-stack {
      display: flex;
      align-items: center;
    }

    .avatar {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 600;
      color: white;
      border: 2px solid white;
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08);
      cursor: pointer;
      position: relative;
      margin-left: -6px;
      transition: transform 0.15s ease, margin-left 0.15s ease;
      z-index: 1;
    }

    .avatar:first-child {
      margin-left: 0;
    }

    .avatar:hover {
      transform: translateY(-2px);
      z-index: 10;
    }

    .avatars-stack:hover .avatar {
      margin-left: 2px;
    }

    .avatars-stack:hover .avatar:first-child {
      margin-left: 0;
    }

    .avatar-tooltip {
      position: absolute;
      top: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%);
      background: #18181b;
      color: white;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 12px;
      white-space: nowrap;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.15s ease, visibility 0.15s ease;
      z-index: 1000;
      pointer-events: none;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .avatar-tooltip::before {
      content: '';
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 6px solid transparent;
      border-bottom-color: #18181b;
    }

    .avatar:hover .avatar-tooltip {
      opacity: 1;
      visibility: visible;
    }

    .tooltip-name {
      font-weight: 600;
      margin-bottom: 2px;
    }

    .tooltip-location {
      font-size: 11px;
      color: #a1a1aa;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .tooltip-location-icon {
      width: 12px;
      height: 12px;
      opacity: 0.7;
    }

    .overflow-badge {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 9px;
      font-weight: 600;
      color: #52525b;
      background: #f4f4f5;
      border: 2px solid white;
      margin-left: -6px;
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08);
    }

    .live-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #22c55e;
      animation: pulse-dot 2s infinite;
    }

    @keyframes pulse-dot {
      0%, 100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.7;
        transform: scale(1.1);
      }
    }

    .user-count {
      font-size: 12px;
      font-weight: 500;
      color: #52525b;
      padding-left: 4px;
    }

    .disconnected {
      opacity: 0.5;
    }

    .disconnected .live-dot {
      background: #ef4444;
      animation: none;
    }

    /* Empty state - only show when disconnected */
    .empty-wrapper {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 20px;
      border: 1px solid rgba(0, 0, 0, 0.08);
    }

    .offline-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #d4d4d8;
    }

    .offline-text {
      font-size: 11px;
      color: #a1a1aa;
    }
  `;

  private usersController = new StoreController(this, $otherPresenceUsers);
  private connectedController = new StoreController(this, $presenceConnected);
  private allUsersController = new StoreController(this, $presenceUsers);

  // Vibrant color palette for avatars
  private colors = [
    '#6366f1', // indigo
    '#8b5cf6', // violet
    '#d946ef', // fuchsia
    '#ec4899', // pink
    '#f43f5e', // rose
    '#f97316', // orange
    '#eab308', // yellow
    '#22c55e', // green
    '#14b8a6', // teal
    '#06b6d4', // cyan
    '#3b82f6', // blue
  ];

  private getInitials(user: PresenceUser): string {
    const name = user.username || 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  private getColor(userId: string): string {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return this.colors[Math.abs(hash) % this.colors.length];
  }

  private getLocationText(user: PresenceUser): string {
    const parts: string[] = [];
    if (user.metadata.pageName) {
      parts.push(user.metadata.pageName);
    }
    if (user.metadata.componentName) {
      parts.push(user.metadata.componentName);
    }
    return parts.length > 0 ? parts.join(' → ') : 'Viewing app';
  }

  render() {
    const otherUsers = this.usersController.value;
    const allUsers = this.allUsersController.value;
    const isConnected = this.connectedController.value;
    const maxVisible = 4;
    const visibleUsers = otherUsers.slice(0, maxVisible);
    const overflowCount = otherUsers.length - maxVisible;

    // If disconnected, show offline state
    if (!isConnected) {
      return html`
        <div class="empty-wrapper">
          <span class="offline-dot"></span>
          <span class="offline-text">Offline</span>
        </div>
      `;
    }

    // If no other users, show minimal indicator with live dot
    if (otherUsers.length === 0) {
      return html`
        <div class="presence-wrapper">
          <span class="live-dot"></span>
          <span class="user-count">Only you</span>
        </div>
      `;
    }

    return html`
      <div class="presence-wrapper">
        <span class="live-dot"></span>
        <div class="avatars-stack">
          ${visibleUsers.map(user => html`
            <div
              class="avatar"
              style="background-color: ${this.getColor(user.userId)}"
              title="${user.username}"
            >
              ${this.getInitials(user)}
              <div class="avatar-tooltip">
                <div class="tooltip-name">${user.username}</div>
                <div class="tooltip-location">
                  <svg class="tooltip-location-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  ${this.getLocationText(user)}
                </div>
              </div>
            </div>
          `)}
          ${overflowCount > 0 ? html`
            <div class="overflow-badge">+${overflowCount}</div>
          ` : ''}
        </div>
        <span class="user-count">${allUsers.length} online</span>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'presence-indicator': PresenceIndicator;
  }
}
