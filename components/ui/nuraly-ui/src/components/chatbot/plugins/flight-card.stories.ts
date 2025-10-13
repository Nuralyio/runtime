/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html } from 'lit';
import { FlightCardPlugin, type FlightInfo } from './flight-card-plugin.js';
import { ChatbotCoreController } from '../core/chatbot-core.controller.js';
import { MockProvider } from '../providers/mock-provider.js';
import '../chatbot.component.js';
import type { Meta, StoryObj } from '@storybook/web-components';

const meta: Meta = {
  title: 'Components/Chatbot/Plugins/Flight Card',
  component: 'nr-chatbot',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Flight Card Plugin

A plugin that transforms flight information into beautiful, interactive cards.

## Features

- 🎨 Beautiful card design matching modern flight apps
- 🔧 Fully customizable (styles, templates, city names)
- 📱 Responsive design for mobile and desktop
- 🌙 Automatic dark mode support
- ♿ Accessible with semantic HTML
- 🔒 XSS protection with HTML escaping

## Usage

\`\`\`typescript
import { FlightCardPlugin } from '@nuraly/chatbot/plugins';

const controller = new ChatbotCoreController({
  plugins: [new FlightCardPlugin()]
});
\`\`\`

The plugin detects flight data in two formats:

1. **JSON**: \`{ "type": "flight", "origin": "JED", ... }\`
2. **Markup**: \`[FLIGHT]{ ... }[/FLIGHT]\`
        `
      }
    }
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

/**
 * Interactive chatbot with flight card plugin.
 * Type messages to see flight cards appear!
 */
export const InteractiveChatbot: Story = {
  render: () => {
    // Sample flight data
    const flights: Record<string, FlightInfo> = {
      'jed-tun': {
        origin: 'JED',
        destination: 'TUN',
        departureTime: '11:40 PM',
        arrivalTime: '2:35 AM',
        departureDate: 'mar. 14 oct.',
        arrivalDate: 'mer. 15 oct.',
        duration: '4h 55min',
        terminal: 'N',
        gate: '12',
        arrivalTerminal: 'M',
        arrivalGate: '8',
        flightNumber: 'SV123',
        airline: 'Saudia',
        status: 'On Time',
        updated: 'Mis à jour il y a 1j 13h',
        source: 'Cirium'
      },
      'cdg-jfk': {
        origin: 'CDG',
        destination: 'JFK',
        departureTime: '10:30 AM',
        arrivalTime: '1:15 PM',
        departureDate: 'lun. 20 oct.',
        arrivalDate: 'lun. 20 oct.',
        duration: '8h 45min',
        terminal: '2E',
        gate: 'K45',
        arrivalTerminal: '1',
        arrivalGate: '22',
        airline: 'Air France',
        flightNumber: 'AF007',
        status: 'Boarding',
        updated: 'Mis à jour il y a 15min',
        source: 'FlightStats'
      },
      'dxb-lhr': {
        origin: 'DXB',
        destination: 'LHR',
        departureTime: '3:45 AM',
        arrivalTime: '7:10 AM',
        departureDate: 'mer. 22 oct.',
        arrivalDate: 'mer. 22 oct.',
        duration: '7h 25min',
        terminal: '3',
        gate: 'B18',
        arrivalTerminal: '3',
        arrivalGate: '5',
        airline: 'Emirates',
        flightNumber: 'EK001',
        status: 'Delayed',
        updated: 'Mis à jour il y a 2h',
        source: 'FlightAware'
      },
      'lax-sfo': {
        origin: 'LAX',
        destination: 'SFO',
        departureTime: '6:00 AM',
        arrivalTime: '7:30 AM',
        departureDate: 'jeu. 16 oct.',
        arrivalDate: 'jeu. 16 oct.',
        duration: '1h 30min',
        terminal: '5',
        gate: '50B',
        arrivalTerminal: '2',
        arrivalGate: '25',
        airline: 'United',
        flightNumber: 'UA123',
        updated: 'Mis à jour il y a 30min',
        source: 'FlightAware'
      }
    };

    // Create mock provider with flight responses
    const mockProvider = new MockProvider({
      contextualResponses: false,
      useHistory: false,
      delay: 500,
      streaming: true,
      streamingInterval: 10,
      customResponses: [
  `<p><strong>Flight summary demo</strong></p>
<p>This introduction is intentionally long so you can observe true word‑by‑word streaming before the card is rendered. It mimics a natural response, sets context, and proves that HTML blocks appear exactly where their tags close.</p>
<p><em>Route:</em> <strong>JED → TUN</strong>. Below are the structured details:</p>

[FLIGHT]${JSON.stringify(flights['jed-tun'])}[/FLIGHT]`,
  `<p><strong>Flight summary demo</strong></p>
<p>This introduction is intentionally long so you can observe true word‑by‑word streaming before the card is rendered. It mimics a natural response, sets context, and proves that HTML blocks appear exactly where their tags close.</p>
<p><em>Route:</em> <strong>CDG → JFK</strong>. Below are the structured details:</p>

[FLIGHT]${JSON.stringify(flights['cdg-jfk'])}[/FLIGHT]`,
  `<p><strong>Flight summary demo</strong></p>
<p>This introduction is intentionally long so you can observe true word‑by‑word streaming before the card is rendered. It mimics a natural response, sets context, and proves that HTML blocks appear exactly where their tags close.</p>
<p><em>Route:</em> <strong>DXB → LHR</strong>. Below are the structured details:</p>

[FLIGHT]${JSON.stringify(flights['dxb-lhr'])}[/FLIGHT]`,
  `<p><strong>Flight summary demo</strong></p>
<p>This introduction is intentionally long so you can observe true word‑by‑word streaming before the card is rendered. It mimics a natural response, sets context, and proves that HTML blocks appear exactly where their tags close.</p>
<p><em>Route:</em> <strong>LAX → SFO</strong>. Below are the structured details:</p>

[FLIGHT]${JSON.stringify(flights['lax-sfo'])}[/FLIGHT]`,
  `<p><strong>All flights demo</strong></p>
<p>This response showcases multiple flight cards in a single streamed message. The long preface is here to demonstrate that text keeps streaming naturally; once each [FLIGHT] block closes, the corresponding card is inserted in place without breaking the flow.</p>
<p>Scroll through the options below:</p>

[FLIGHT]${JSON.stringify(flights['jed-tun'])}[/FLIGHT]

[FLIGHT]${JSON.stringify(flights['cdg-jfk'])}[/FLIGHT]

[FLIGHT]${JSON.stringify(flights['dxb-lhr'])}[/FLIGHT]

[FLIGHT]${JSON.stringify(flights['lax-sfo'])}[/FLIGHT]`
      ]
    });

    // Connect provider (async)
    mockProvider.connect();

    // Create controller with flight card plugin
    const controller = new ChatbotCoreController({
      provider: mockProvider,
      plugins: [new FlightCardPlugin()],
      initialMessages: [
        {
          id: '1',
          sender: 'bot' as any,
          text: 'Hello! 👋 I can help you find flight information.\n\nTry asking:\n• "Show me flights from JED to TUN"\n• "What about Paris to New York?"\n• "Show all flights"\n• "Find me a short flight"',
          timestamp: new Date().toISOString(),
          introduction: true,
          suggestions: [
            { id: 'Show me flights from JED to TUN', text: 'Show me flights from JED to TUN'  , enabled: true },
            { id: 'Show all flights', text: 'Show all flights', enabled: true },
            { id: 'Show the shortest flight', text: 'Show the shortest flight' , enabled: true },
            { id: 'Show me flights from CDG to JFK', text: 'Show me flights from CDG to JFK' , enabled: true },
            { id: 'Show me flights from DXB to LHR', text: 'Show me flights from DXB to LHR' , enabled: true },
            { id: 'Show me flights from LAX to SFO', text: 'Show me flights from LAX to SFO', enabled: true}
          ]
        }
      ]
    });

    // Set up the element with controller after render
    setTimeout(() => {
      const chatbot = document.querySelector('nr-chatbot');
      if (chatbot) {
        (chatbot as any).controller = controller;
      }
    }, 0);

    return html`
      <div style="height: 100vh; display: flex; flex-direction: column;">
        <nr-chatbot
          placeholder="Ask about flights..."
          size="full"
          variant="default"
          .showSendButton=${true}
          .autoScroll=${true}
        ></nr-chatbot>
      </div>
    `;
  }
};

/**
 * Basic flight card with minimal required fields
 */
export const BasicFlightCard: Story = {
  render: () => {
    const plugin = new FlightCardPlugin();
    plugin.onInit?.();

    const flightData: FlightInfo = {
      origin: 'JED',
      destination: 'TUN',
      departureTime: '11:40 PM',
      arrivalTime: '2:35 AM',
      departureDate: 'mar. 14 oct.',
      arrivalDate: 'mer. 15 oct.',
      duration: '4h 55min',
      terminal: 'N',
      arrivalTerminal: 'M'
    };

    const cardHtml = (plugin as any).renderFlightCard(flightData);

    return html`
      <div style="padding: 40px; max-width: 800px; margin: 0 auto; background: #f5f5f5;">
        <h2 style="margin-bottom: 24px;">Basic Flight Card</h2>
        <p style="color: #666; margin-bottom: 24px;">Essential flight information with minimal required fields</p>
        <div .innerHTML=${cardHtml}></div>
      </div>
    `;
  }
};

/**
 * Complete flight card with all optional fields populated
 */
export const CompleteFlightCard: Story = {
  render: () => {
    const plugin = new FlightCardPlugin();
    plugin.onInit?.();

    const flightData: FlightInfo = {
      origin: 'JED',
      destination: 'TUN',
      departureTime: '11:40 PM',
      arrivalTime: '2:35 AM',
      departureDate: 'mar. 14 oct.',
      arrivalDate: 'mer. 15 oct.',
      duration: '4h 55min',
      terminal: 'N',
      gate: '12',
      arrivalTerminal: 'M',
      arrivalGate: '8',
      flightNumber: 'SV123',
      airline: 'Saudia',
      status: 'On Time',
      updated: 'Mis à jour il y a 1j 13h',
      source: 'Cirium'
    };

    const cardHtml = (plugin as any).renderFlightCard(flightData);

    return html`
      <div style="padding: 40px; max-width: 800px; margin: 0 auto; background: #f5f5f5;">
        <h2 style="margin-bottom: 24px;">Complete Flight Card</h2>
        <p style="color: #666; margin-bottom: 24px;">All fields populated including gates, airline, status, and metadata</p>
        <div .innerHTML=${cardHtml}></div>
      </div>
    `;
  }
};

/**
 * Multiple flight cards displayed together
 */
export const MultipleFlightCards: Story = {
  render: () => {
    const plugin = new FlightCardPlugin();
    plugin.onInit?.();

    const flights: FlightInfo[] = [
      {
        origin: 'JED',
        destination: 'TUN',
        departureTime: '11:40 PM',
        arrivalTime: '2:35 AM',
        departureDate: 'mar. 14 oct.',
        arrivalDate: 'mer. 15 oct.',
        duration: '4h 55min',
        terminal: 'N',
        gate: '12',
        arrivalTerminal: 'M',
        arrivalGate: '8',
        flightNumber: 'SV123',
        airline: 'Saudia',
        status: 'On Time',
        updated: 'Mis à jour il y a 1j 13h',
        source: 'Cirium'
      },
      {
        origin: 'CDG',
        destination: 'JFK',
        departureTime: '10:30 AM',
        arrivalTime: '1:15 PM',
        departureDate: 'lun. 20 oct.',
        arrivalDate: 'lun. 20 oct.',
        duration: '8h 45min',
        terminal: '2E',
        gate: 'K45',
        arrivalTerminal: '1',
        arrivalGate: '22',
        airline: 'Air France',
        flightNumber: 'AF007',
        status: 'Boarding',
        updated: 'Mis à jour il y a 15min',
        source: 'FlightStats'
      },
      {
        origin: 'DXB',
        destination: 'LHR',
        departureTime: '3:45 AM',
        arrivalTime: '7:10 AM',
        departureDate: 'mer. 22 oct.',
        arrivalDate: 'mer. 22 oct.',
        duration: '7h 25min',
        terminal: '3',
        gate: 'B18',
        arrivalTerminal: '3',
        arrivalGate: '5',
        airline: 'Emirates',
        flightNumber: 'EK001',
        status: 'Delayed',
        updated: 'Mis à jour il y a 2h',
        source: 'FlightAware'
      }
    ];

    return html`
      <div style="padding: 40px; max-width: 800px; margin: 0 auto; background: #f5f5f5;">
        <h2 style="margin-bottom: 24px;">Multiple Flight Cards</h2>
        <p style="color: #666; margin-bottom: 24px;">Compare different flights at once</p>
        ${flights.map(flight => {
          const cardHtml = (plugin as any).renderFlightCard(flight);
          return html`<div .innerHTML=${cardHtml}></div>`;
        })}
      </div>
    `;
  }
};

/**
 * Dark mode theme demonstration
 */
export const DarkMode: Story = {
  render: () => {
    const plugin = new FlightCardPlugin();
    plugin.onInit?.();

    const flightData: FlightInfo = {
      origin: 'JED',
      destination: 'TUN',
      departureTime: '11:40 PM',
      arrivalTime: '2:35 AM',
      departureDate: 'mar. 14 oct.',
      arrivalDate: 'mer. 15 oct.',
      duration: '4h 55min',
      terminal: 'N',
      gate: '12',
      arrivalTerminal: 'M',
      arrivalGate: '8',
      flightNumber: 'SV123',
      airline: 'Saudia',
      status: 'On Time',
      updated: 'Mis à jour il y a 1j 13h',
      source: 'Cirium'
    };

    const cardHtml = (plugin as any).renderFlightCard(flightData);

    return html`
      <div style="padding: 40px; max-width: 800px; margin: 0 auto; background: #1a1a1a; min-height: 600px; color: white; color-scheme: dark;">
        <h2 style="margin-bottom: 24px; color: white;">Dark Mode</h2>
        <p style="color: #ccc; margin-bottom: 24px;">The card automatically adapts to dark color schemes</p>
        <div .innerHTML=${cardHtml}></div>
      </div>
    `;
  }
};

/**
 * Custom styled flight card with gradient background
 */
export const CustomStyled: Story = {
  render: () => {
    class CustomFlightCardPlugin extends FlightCardPlugin {
      protected override cssPrefix = 'custom-flight-card';

  protected injectStyles(): void {
        if (document.getElementById(`${this.cssPrefix}-styles`)) {
          return;
        }

        const styles = `
          .${this.cssPrefix} {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 20px;
            padding: 32px;
            margin: 16px 0;
            font-family: system-ui, -apple-system, sans-serif;
            max-width: 600px;
            color: white;
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
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
            font-size: 36px;
            font-weight: 700;
            color: white;
            text-shadow: 0 2px 4px rgba(0,0,0,0.2);
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
            background: rgba(255,255,255,0.3);
            z-index: 0;
          }

          .${this.cssPrefix}__plane-icon {
            width: 24px;
            height: 24px;
            color: white;
            background: transparent;
            padding: 4px;
            position: relative;
            z-index: 1;
            transform: rotate(90deg);
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
          }

          .${this.cssPrefix}__duration {
            position: absolute;
            top: -24px;
            background: rgba(255,255,255,0.2);
            backdrop-filter: blur(10px);
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 13px;
            color: white;
            white-space: nowrap;
          }

          .${this.cssPrefix}__flight-info {
            display: flex;
            gap: 8px;
            align-items: center;
            font-size: 14px;
            color: rgba(255,255,255,0.9);
          }

          .${this.cssPrefix}__details {
            display: grid;
            grid-template-columns: 1fr auto 1fr;
            gap: 24px;
          }

          .${this.cssPrefix}__divider {
            width: 1px;
            background: rgba(255,255,255,0.2);
          }

          .${this.cssPrefix}__section {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .${this.cssPrefix}__label {
            font-size: 12px;
            color: rgba(255,255,255,0.8);
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
            color: white;
          }

          .${this.cssPrefix}__date {
            font-size: 13px;
            color: rgba(255,255,255,0.9);
          }

          .${this.cssPrefix}__time-group {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .${this.cssPrefix}__time-label {
            font-size: 12px;
            color: rgba(255,255,255,0.8);
          }

          .${this.cssPrefix}__time-value {
            font-size: 24px;
            font-weight: 700;
            color: white;
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
            color: rgba(255,255,255,0.7);
          }

          .${this.cssPrefix}__info-value {
            font-size: 18px;
            font-weight: 600;
            color: white;
          }

          .${this.cssPrefix}__footer {
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid rgba(255,255,255,0.2);
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: rgba(255,255,255,0.8);
            gap: 12px;
          }

          @media (max-width: 640px) {
            .${this.cssPrefix} {
              padding: 20px;
            }

            .${this.cssPrefix}__details {
              grid-template-columns: 1fr;
              gap: 16px;
            }

            .${this.cssPrefix}__divider {
              height: 1px;
              width: 100%;
            }
          }
        `;

        const styleElement = document.createElement('style');
        styleElement.id = `${this.cssPrefix}-styles`;
        styleElement.textContent = styles;
        document.head.appendChild(styleElement);
      }
    }

    const plugin = new CustomFlightCardPlugin();
    plugin.onInit?.();

    const flightData: FlightInfo = {
      origin: 'JED',
      destination: 'TUN',
      departureTime: '11:40 PM',
      arrivalTime: '2:35 AM',
      departureDate: 'mar. 14 oct.',
      arrivalDate: 'mer. 15 oct.',
      duration: '4h 55min',
      terminal: 'N',
      gate: '12',
      arrivalTerminal: 'M',
      arrivalGate: '8',
      flightNumber: 'SV123',
      airline: 'Saudia'
    };

    const cardHtml = (plugin as any).renderFlightCard(flightData);

    return html`
      <div style="padding: 40px; max-width: 800px; margin: 0 auto; background: #f5f5f5;">
        <h2 style="margin-bottom: 24px;">Custom Styled Card</h2>
        <p style="color: #666; margin-bottom: 24px;">Example of extending the plugin with custom gradient styling</p>
        <div .innerHTML=${cardHtml}></div>
      </div>
    `;
  }
};

/**
 * Responsive design demonstration showing mobile and desktop views
 */
export const ResponsiveDesign: Story = {
  render: () => {
    const plugin = new FlightCardPlugin();
    plugin.onInit?.();

    const flightData: FlightInfo = {
      origin: 'JED',
      destination: 'TUN',
      departureTime: '11:40 PM',
      arrivalTime: '2:35 AM',
      departureDate: 'mar. 14 oct.',
      arrivalDate: 'mer. 15 oct.',
      duration: '4h 55min',
      terminal: 'N',
      gate: '12',
      arrivalTerminal: 'M',
      arrivalGate: '8',
      flightNumber: 'SV123',
      airline: 'Saudia',
      updated: 'Mis à jour il y a 1j 13h',
      source: 'Cirium'
    };

    const cardHtml = (plugin as any).renderFlightCard(flightData);

    return html`
      <div style="padding: 40px; background: #f5f5f5;">
        <h2 style="margin-bottom: 24px;">Responsive Design</h2>
        <p style="color: #666; margin-bottom: 32px;">The card adapts to different screen sizes</p>
        
        <div style="display: grid; gap: 40px; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); max-width: 1200px;">
          <div>
            <h3 style="margin-bottom: 16px;">Desktop View (600px+)</h3>
            <div style="width: 100%; max-width: 600px;">
              <div .innerHTML=${cardHtml}></div>
            </div>
          </div>
          
          <div>
            <h3 style="margin-bottom: 16px;">Mobile View (375px)</h3>
            <div style="width: 375px; max-width: 100%;">
              <div .innerHTML=${cardHtml}></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
};

/**
 * Minimal flight card showing only required fields
 */
export const MinimalFlightCard: Story = {
  render: () => {
    const plugin = new FlightCardPlugin();
    plugin.onInit?.();

    const flightData: FlightInfo = {
      origin: 'LAX',
      destination: 'SFO',
      departureTime: '6:00 AM',
      arrivalTime: '7:30 AM',
      departureDate: '',
      arrivalDate: '',
      duration: '1h 30min'
    };

    const cardHtml = (plugin as any).renderFlightCard(flightData);

    return html`
      <div style="padding: 40px; max-width: 800px; margin: 0 auto; background: #f5f5f5;">
        <h2 style="margin-bottom: 24px;">Minimal Flight Card</h2>
        <p style="color: #666; margin-bottom: 24px;">Only the absolutely required fields (origin, destination, times, duration)</p>
        <div .innerHTML=${cardHtml}></div>
      </div>
    `;
  }
};

/**
 * JSON data format reference
 */
export const DataFormat: Story = {
  render: () => {
    const jsonExample = {
      type: 'flight',
      origin: 'JED',
      destination: 'TUN',
      departureTime: '11:40 PM',
      arrivalTime: '2:35 AM',
      departureDate: 'mar. 14 oct.',
      arrivalDate: 'mer. 15 oct.',
      duration: '4h 55min',
      terminal: 'N',
      gate: '12',
      arrivalTerminal: 'M',
      arrivalGate: '8',
      flightNumber: 'SV123',
      airline: 'Saudia',
      status: 'On Time',
      updated: 'Mis à jour il y a 1j 13h',
      source: 'Cirium'
    };

    const markupExample = `[FLIGHT]${JSON.stringify(jsonExample, null, 2)}[/FLIGHT]`;

    return html`
      <div style="padding: 40px; max-width: 900px; margin: 0 auto;">
        <h2 style="margin-bottom: 24px;">Data Format Reference</h2>
        
        <div style="margin-bottom: 40px;">
          <h3 style="margin-bottom: 16px;">Option 1: JSON Format</h3>
          <p style="color: #666; margin-bottom: 16px;">Send flight data as a JSON string with <code>type: "flight"</code></p>
          <pre style="background: #2d2d2d; color: #f8f8f2; padding: 20px; border-radius: 8px; overflow-x: auto; font-size: 14px; line-height: 1.5;">
${JSON.stringify(jsonExample, null, 2)}</pre>
        </div>

        <div style="margin-bottom: 40px;">
          <h3 style="margin-bottom: 16px;">Option 2: Markup Format</h3>
          <p style="color: #666; margin-bottom: 16px;">Wrap flight data in <code>[FLIGHT]...[/FLIGHT]</code> tags</p>
          <pre style="background: #2d2d2d; color: #f8f8f2; padding: 20px; border-radius: 8px; overflow-x: auto; font-size: 14px; line-height: 1.5; white-space: pre-wrap;">${markupExample}</pre>
        </div>

        <div>
          <h3 style="margin-bottom: 16px;">TypeScript Interface</h3>
          <pre style="background: #2d2d2d; color: #f8f8f2; padding: 20px; border-radius: 8px; overflow-x: auto; font-size: 14px; line-height: 1.5;">interface FlightInfo {
  // Required
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  
  // Optional
  departureDate?: string;
  arrivalDate?: string;
  duration?: string;
  terminal?: string;
  gate?: string;
  arrivalTerminal?: string;
  arrivalGate?: string;
  flightNumber?: string;
  airline?: string;
  status?: string;
  updated?: string;
  source?: string;
}</pre>
        </div>
      </div>
    `;
  }
};
