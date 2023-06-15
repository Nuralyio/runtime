/* eslint-disable @typescript-eslint/no-explicit-any */
import {css, html, LitElement} from 'lit';
import {property, state} from 'lit/decorators.js';

class TooltipElement extends LitElement {
  static override styles = css`
    .tooltip {
      top: 0px;
      position: absolute;
      padding: 4px 8px;
      background-color: #000;
      color: #fff;
      border-radius: 4px;
      font-size: 14px;
    }

    .tooltip.top::after {
      content: '';
      position: absolute;
      top: -8px;
      left: 50%;
      transform: translateX(-50%);
      border-width: 8px 8px 0;
      border-style: solid;
      border-color: #000 transparent transparent transparent;
    }

    .tooltip.bottom::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      border-width: 0 8px 8px;
      border-style: solid;
      border-color: transparent transparent #000 transparent;
    }

    .tooltip.left::after {
      content: '';
      position: absolute;
      top: 50%;
      left: -8px;
      transform: translateY(-50%);
      border-width: 8px 0 8px 8px;
      border-style: solid;
      border-color: transparent transparent transparent #000;
    }

    .tooltip.right::after {
      content: '';
      position: absolute;
      top: 50%;
      right: -8px;
      transform: translateY(-50%);
      border-width: 8px 8px 8px 0;
      border-style: solid;
      border-color: transparent #000 transparent transparent;
    }

    .tooltip.corner-left::after {
      content: '';
      position: absolute;
      top: 0;
      left: -8px;
      border-width: 8px 0 8px 8px;
      border-style: solid;
      border-color: transparent transparent transparent #000;
    }

    .tooltip.corner-right::after {
      content: '';
      position: absolute;
      top: 0;
      right: -8px;
      border-width: 8px 8px 8px 0;
      border-style: solid;
      border-color: transparent #000 transparent transparent;
    }
  `;
  @property({type: String})
  text!: string;

  @property({type: String})
  position!: string;

  @property({type: Number})
  delay!: number;

  @state()
  tooltip!: any;

  @state()
  hideTimeout!: any;

  @state()
  isActive!: any;

  constructor() {
    super();
    this.position = 'top';
    this.delay = 200;
    this.tooltip = null;
    this.hideTimeout = null;
  }

  override firstUpdated() {
    const targetElement = this.querySelectorAll('[data-tooltip]');
    this.tooltip = this.shadowRoot!.querySelector('.tooltip');

    for (const element of targetElement) {
      element.addEventListener('mouseenter', this.showTooltip.bind(this));
      element.addEventListener('mouseleave', this.hideTooltip.bind(this));
    }
  }

  showTooltip(event: any) {
    const targetElement = event.target.closest('[data-tooltip]');
    console.log(targetElement.getBoundingClientRect());

    const tooltipText = targetElement.dataset.tooltip;
    if (tooltipText) {
      this.text = tooltipText;
      this.position = targetElement.dataset.tooltipPosition || 'top';
      if (this.tooltip) {
        this.tooltip.style.top =
          targetElement.getBoundingClientRect().y + targetElement.getBoundingClientRect().height + 9 + 'px';
        this.tooltip.style.opacity = '1';
        this.tooltip.style.visibility = 'visible';
      }
    }
  }

  hideTooltip() {
    if (this.tooltip) {
      this.tooltip.style.opacity = '0';
      this.tooltip.style.visibility = 'hidden';
    }
  }

  override render() {
    const tooltipClasses: TooltipClasses = {
      top: 'tooltip top',
      bottom: 'tooltip bottom',
      left: 'tooltip left',
      right: 'tooltip right',
      'corner-left': 'tooltip corner-left',
      'corner-right': 'tooltip corner-right',
    };

    const tooltipClass = tooltipClasses[this.position] || tooltipClasses.top;

    return html`<slot></slot>
      <span class="${tooltipClass}">${this.text}</span> `;
  }
}
interface TooltipClasses {
  top: string;
  bottom: string;
  left: string;
  right: string;
  'corner-left': string;
  'corner-right': string;
  [key: string]: string;
}

customElements.define('tooltip-element', TooltipElement);
