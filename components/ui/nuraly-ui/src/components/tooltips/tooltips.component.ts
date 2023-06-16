/* eslint-disable @typescript-eslint/no-explicit-any */
import {html, LitElement} from 'lit';
import {property, state} from 'lit/decorators.js';
import {styles} from './tooltips.style';

class TooltipElement extends LitElement {
  static override styles = styles;

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
      console.log(targetElement);
      if (this.tooltip) {
        this.tooltip.style.top =
          targetElement.getBoundingClientRect().top - targetElement.getBoundingClientRect().height - 9 + 'px';
        this.tooltip.style.marginLeft = '-' + targetElement.getBoundingClientRect().width / 2 + 'px';
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
