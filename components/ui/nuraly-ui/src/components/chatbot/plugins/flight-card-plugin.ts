/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import type { ChatbotPlugin } from '../core/types.js';
import { ChatPluginBase } from './chat-plugin.js';

/**
 * Interface for flight information
 */
export interface FlightInfo {
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  departureDate: string;
  arrivalDate: string;
  terminal?: string;
  gate?: string;
  arrivalTerminal?: string;
  arrivalGate?: string;
  duration: string;
  flightNumber?: string;
  airline?: string;
  status?: string;
  updated?: string;
  source?: string;
}

/**
 * Flight Card Plugin - transforms flight information into visual cards
 * 
 * This plugin detects flight information in messages and renders them as styled cards.
 * Developers can customize the card template by extending this class.
 * 
 * @example Basic usage
 * ```typescript
 * const flightPlugin = new FlightCardPlugin();
 * controller.registerPlugin(flightPlugin);
 * ```
 * 
 * @example Custom template
 * ```typescript
 * class MyFlightCardPlugin extends FlightCardPlugin {
 *   protected renderFlightCard(flight: FlightInfo): string {
 *     return `<div class="my-custom-card">...</div>`;
 *   }
 * }
 * ```
 * 
 * @example JSON format in message
 * ```json
 * {
 *   "type": "flight",
 *   "origin": "JED",
 *   "destination": "TUN",
 *   "departureTime": "11:40 PM",
 *   "arrivalTime": "2:35 AM",
 *   "departureDate": "mar. 14 oct.",
 *   "arrivalDate": "mer. 15 oct.",
 *   "duration": "4h 55min",
 *   "terminal": "N",
 *   "arrivalTerminal": "M"
 * }
 * ```
 */
export class FlightCardPlugin extends ChatPluginBase implements ChatbotPlugin {
  readonly id = 'flight-card';
  readonly name = 'Flight Card Plugin';
  readonly version = '1.0.0';
  override readonly htmlTags = [
    { name: 'flight', open: '[FLIGHT]', close: '[/FLIGHT]' }
  ];

  /**
   * CSS class prefix for styling
   */
  protected cssPrefix = 'nr-flight-card';
  
  /**
   * Render a skeleton placeholder while the flight data is loading
   */
  renderHtmlBlockPlaceholder?(name: string): string {
    if (name.toLowerCase() !== 'flight') return '';
    
    const placeholderId = `flight-skeleton-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return `<div data-placeholder-id="${placeholderId}"><nr-skeleton 
        active 
        style="min-width: 400px; max-width: 600px; margin: 16px 0;"
      ></nr-skeleton></div>`;
  }
  // Simplified: no shadow DOM observation or external style injection
  // All style-injection logic lives in ChatPluginBase

  override onInit(): void {
    console.log('[FlightCardPlugin] Initialized');
    // No-op: styles are inlined per message to work inside shadow DOM
  }

  // State change handling is inherited from ChatPluginBase

  /**
   * Process received messages and convert flight data to cards
   */
  override async afterReceive(text: string): Promise<string> {
    // Try to parse as JSON first (for structured flight data)
    try {
      const data = JSON.parse(text);
      if (data.type === 'flight' || this.isFlightData(data)) {
        return this.renderFlightCard(data as FlightInfo);
      }
    } catch {
      // Not JSON, continue with text processing
    }

    // Look for flight data markers in text
    const flightPattern = /\[FLIGHT\]([\s\S]*?)\[\/FLIGHT\]/g;
    let transformed = text;
    
    let match;
    while ((match = flightPattern.exec(text)) !== null) {
      try {
        const flightData = JSON.parse(match[1]);
        const card = this.renderFlightCard(flightData);
        transformed = transformed.replace(match[0], card);
      } catch (e) {
        console.warn('[FlightCardPlugin] Failed to parse flight data:', e);
      }
    }

    return transformed;
  }

  /**
   * Render a completed [FLIGHT]...[/FLIGHT] block when tokenized by the Provider/Service
   */
  override renderHtmlBlock(name: string, content: string): string {
    if (name.toLowerCase() !== 'flight') return '';
    try {
      const data = JSON.parse(content);
      return this.renderFlightCard(data as FlightInfo);
    } catch (e) {
      console.warn('[FlightCardPlugin] renderHtmlBlock parse error:', e);
      return '';
    }
  }

  /**
   * Check if data object contains flight information
   */
  protected isFlightData(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      data.origin &&
      data.destination &&
      data.departureTime
    );
  }

  /**
   * Render flight information as a card
   * Override this method to customize the card appearance
   */
  protected renderFlightCard(flight: FlightInfo): string {
    const {
      origin,
      destination,
      departureTime,
      arrivalTime,
      departureDate,
      arrivalDate,
      terminal,
      gate,
      arrivalTerminal,
      arrivalGate,
      duration,
      flightNumber,
      airline,
      status,
      updated,
      source
    } = flight;

    // Inline styles so it works inside nr-chatbot's shadow DOM without extra wiring
    // Inject only once per conversation and mark with a data attribute
    const styleTag = this.getOncePerConversationStyleTag(this.getStyles());
    return `
      ${styleTag}
      <div class="${this.cssPrefix}" data-nr-flight-card="true">
        <div class="${this.cssPrefix}__header">
          <div class="${this.cssPrefix}__route">
            <span class="${this.cssPrefix}__airport-code">${this.escapeHtml(origin)}</span>
            <div class="${this.cssPrefix}__flight-line">
              <svg class="${this.cssPrefix}__plane-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="currentColor"/>
              </svg>
              ${duration ? `<span class="${this.cssPrefix}__duration">${this.escapeHtml(duration)}</span>` : ''}
            </div>
            <span class="${this.cssPrefix}__airport-code">${this.escapeHtml(destination)}</span>
          </div>
          ${flightNumber || airline ? `
            <div class="${this.cssPrefix}__flight-info">
              ${airline ? `<span class="${this.cssPrefix}__airline">${this.escapeHtml(airline)}</span>` : ''}
              ${flightNumber ? `<span class="${this.cssPrefix}__flight-number">${this.escapeHtml(flightNumber)}</span>` : ''}
            </div>
          ` : ''}
        </div>

        <div class="${this.cssPrefix}__details">
          <div class="${this.cssPrefix}__section ${this.cssPrefix}__section--departure">
            <div class="${this.cssPrefix}__label">Infos sur l'aéroport</div>
            <div class="${this.cssPrefix}__location">
              <span class="${this.cssPrefix}__city">${this.getCityName(origin)}</span>
              <span class="${this.cssPrefix}__date">${departureDate ? this.escapeHtml(departureDate) : ''}</span>
            </div>
            <div class="${this.cssPrefix}__time-group">
              <div class="${this.cssPrefix}__time-label">Heure de départ prévue</div>
              <div class="${this.cssPrefix}__time-value">${this.escapeHtml(departureTime)}</div>
            </div>
            <div class="${this.cssPrefix}__terminal-gate">
              ${terminal ? `
                <div class="${this.cssPrefix}__info-item">
                  <span class="${this.cssPrefix}__info-label">Terminal</span>
                  <span class="${this.cssPrefix}__info-value">${this.escapeHtml(terminal)}</span>
                </div>
              ` : ''}
              ${gate ? `
                <div class="${this.cssPrefix}__info-item">
                  <span class="${this.cssPrefix}__info-label">Porte</span>
                  <span class="${this.cssPrefix}__info-value">${this.escapeHtml(gate)}</span>
                </div>
              ` : gate === undefined ? `
                <div class="${this.cssPrefix}__info-item">
                  <span class="${this.cssPrefix}__info-label">Porte</span>
                  <span class="${this.cssPrefix}__info-value">-</span>
                </div>
              ` : ''}
            </div>
          </div>

          <div class="${this.cssPrefix}__divider"></div>

          <div class="${this.cssPrefix}__section ${this.cssPrefix}__section--arrival">
            <div class="${this.cssPrefix}__label">Infos sur l'aéroport</div>
            <div class="${this.cssPrefix}__location">
              <span class="${this.cssPrefix}__city">${this.getCityName(destination)}</span>
              <span class="${this.cssPrefix}__date">${arrivalDate ? this.escapeHtml(arrivalDate) : ''}</span>
            </div>
            <div class="${this.cssPrefix}__time-group">
              <div class="${this.cssPrefix}__time-label">Heure d'arrivée prévue</div>
              <div class="${this.cssPrefix}__time-value">${this.escapeHtml(arrivalTime)}</div>
            </div>
            <div class="${this.cssPrefix}__terminal-gate">
              ${arrivalTerminal ? `
                <div class="${this.cssPrefix}__info-item">
                  <span class="${this.cssPrefix}__info-label">Terminal</span>
                  <span class="${this.cssPrefix}__info-value">${this.escapeHtml(arrivalTerminal)}</span>
                </div>
              ` : ''}
              ${arrivalGate ? `
                <div class="${this.cssPrefix}__info-item">
                  <span class="${this.cssPrefix}__info-label">Porte</span>
                  <span class="${this.cssPrefix}__info-value">${this.escapeHtml(arrivalGate)}</span>
                </div>
              ` : arrivalGate === undefined ? `
                <div class="${this.cssPrefix}__info-item">
                  <span class="${this.cssPrefix}__info-label">Porte</span>
                  <span class="${this.cssPrefix}__info-value">-</span>
                </div>
              ` : ''}
            </div>
          </div>
        </div>

        ${updated || source || status ? `
          <div class="${this.cssPrefix}__footer">
            ${updated ? `<span class="${this.cssPrefix}__updated">${this.escapeHtml(updated)}</span>` : ''}
            ${source ? `<span class="${this.cssPrefix}__source">Source : ${this.escapeHtml(source)}</span>` : ''}
            ${status ? `<span class="${this.cssPrefix}__status">${this.escapeHtml(status)}</span>` : ''}
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Get city name from airport code
   * Override this to provide custom city mappings
   */
  protected getCityName(airportCode: string): string {
    const cityMap: Record<string, string> = {
      'JED': 'Djeddah',
      'TUN': 'Tunis',
      'CDG': 'Paris',
      'LHR': 'London',
      'JFK': 'New York',
      'DXB': 'Dubai',
      'LAX': 'Los Angeles',
      'ORD': 'Chicago',
      'ATL': 'Atlanta',
      'DFW': 'Dallas',
      'DEN': 'Denver',
      'SFO': 'San Francisco',
      'SEA': 'Seattle',
      'LAS': 'Las Vegas',
      'MCO': 'Orlando',
      'MIA': 'Miami',
      'IAH': 'Houston',
      'PHX': 'Phoenix',
      'BOS': 'Boston',
      'MSP': 'Minneapolis',
      'DTW': 'Detroit',
      'FLL': 'Fort Lauderdale',
      'PHL': 'Philadelphia',
      'LGA': 'New York',
      'BWI': 'Baltimore',
      'SLC': 'Salt Lake City',
      'SAN': 'San Diego',
      'DCA': 'Washington',
      'TPA': 'Tampa',
      'PDX': 'Portland',
      'STL': 'St. Louis'
    };

    return cityMap[airportCode.toUpperCase()] || airportCode;
  }

  /**
   * Escape HTML to prevent XSS
   */
  protected escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Inject default styles for the flight card
   * Override this method to provide custom styles
   */
  protected getStyles(): string {
    return `
      .${this.cssPrefix} {
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        padding: 24px;
        margin: 16px 0;
        font-family: system-ui, -apple-system, sans-serif;
        max-width: 600px;
      }

      .${this.cssPrefix}__header {
        margin-bottom: 24px;
      }

      .${this.cssPrefix}__route {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 8px;
      }

      .${this.cssPrefix}__airport-code {
        font-size: 32px;
        font-weight: 700;
        color: #1a1a1a;
        letter-spacing: 0.5px;
      }

      .${this.cssPrefix}__flight-line {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        padding: 0 16px;
      }

      .${this.cssPrefix}__flight-line::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(to right, #e0e0e0 0%, #e0e0e0 100%);
        z-index: 0;
      }

      .${this.cssPrefix}__plane-icon {
        width: 24px;
        height: 24px;
        color: #666;
        background: white;
        padding: 4px;
        position: relative;
        z-index: 1;
        transform: rotate(90deg);
      }

      .${this.cssPrefix}__duration {
        position: absolute;
        top: -24px;
        background: white;
        padding: 2px 8px;
        font-size: 13px;
        color: #666;
        white-space: nowrap;
      }

      .${this.cssPrefix}__flight-info {
        display: flex;
        gap: 8px;
        align-items: center;
        font-size: 14px;
        color: #666;
      }

      .${this.cssPrefix}__airline {
        font-weight: 500;
      }

      .${this.cssPrefix}__flight-number {
        color: #999;
      }

      .${this.cssPrefix}__details {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        gap: 24px;
      }

      .${this.cssPrefix}__divider {
        width: 1px;
        background: #e0e0e0;
      }

      .${this.cssPrefix}__section {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .${this.cssPrefix}__label {
        font-size: 12px;
        color: #999;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-weight: 500;
        text-decoration: underline;
      }

      .${this.cssPrefix}__location {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .${this.cssPrefix}__city {
        font-size: 16px;
        font-weight: 600;
        color: #1a1a1a;
      }

      .${this.cssPrefix}__date {
        font-size: 13px;
        color: #666;
      }

      .${this.cssPrefix}__time-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .${this.cssPrefix}__time-label {
        font-size: 12px;
        color: #666;
      }

      .${this.cssPrefix}__time-value {
        font-size: 24px;
        font-weight: 700;
        color: #2d6a3e;
      }

      .${this.cssPrefix}__terminal-gate {
        display: flex;
        gap: 16px;
      }

      .${this.cssPrefix}__info-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .${this.cssPrefix}__info-label {
        font-size: 11px;
        color: #999;
      }

      .${this.cssPrefix}__info-value {
        font-size: 18px;
        font-weight: 600;
        color: #1a1a1a;
      }

      .${this.cssPrefix}__footer {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid #e0e0e0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        color: #666;
        gap: 12px;
      }

      .${this.cssPrefix}__updated {
        color: #999;
      }

      .${this.cssPrefix}__source {
        color: #666;
      }

      .${this.cssPrefix}__source::before {
        content: '';
        display: inline-block;
        width: 4px;
        height: 4px;
        background: #666;
        border-radius: 50%;
        margin-right: 8px;
        vertical-align: middle;
      }

      .${this.cssPrefix}__status {
        padding: 4px 8px;
        background: #e8f5e9;
        color: #2d6a3e;
        border-radius: 4px;
        font-weight: 500;
      }

      /* Share button styling */
      .${this.cssPrefix}__footer button {
        background: none;
        border: none;
        color: #666;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .${this.cssPrefix}__footer button:hover {
        color: #1a1a1a;
      }

      /* Dark mode support */
      @media (prefers-color-scheme: dark) {
        .${this.cssPrefix} {
          background: #2a2a2a;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .${this.cssPrefix}__airport-code,
        .${this.cssPrefix}__city,
        .${this.cssPrefix}__info-value {
          color: #ffffff;
        }

        .${this.cssPrefix}__flight-line::before {
          background: linear-gradient(to right, #444 0%, #444 100%);
        }

        .${this.cssPrefix}__plane-icon {
          background: #2a2a2a;
          color: #999;
        }

        .${this.cssPrefix}__duration {
          background: #2a2a2a;
        }

        .${this.cssPrefix}__divider {
          background: #444;
        }

        .${this.cssPrefix}__footer {
          border-top-color: #444;
        }
      }

      /* Responsive design */
      @media (max-width: 640px) {
        .${this.cssPrefix} {
          padding: 16px;
        }

        .${this.cssPrefix}__details {
          grid-template-columns: 1fr;
          gap: 16px;
        }

        .${this.cssPrefix}__divider {
          height: 1px;
          width: 100%;
        }

        .${this.cssPrefix}__airport-code {
          font-size: 24px;
        }

        .${this.cssPrefix}__time-value {
          font-size: 20px;
        }

        .${this.cssPrefix}__footer {
          flex-direction: column;
          align-items: flex-start;
        }
      }
    `;
  }
}
