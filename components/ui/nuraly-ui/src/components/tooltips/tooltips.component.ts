/* eslint-disable @typescript-eslint/no-explicit-any */
import {html, LitElement, nothing, PropertyValueMap} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {styles} from './tooltips.style.js';
import {EMPTY_STRING, TooltipAlignment, TooltipPosition} from './tooltips.constant.js';
@customElement('hy-tooltip')
export class TooltipElement extends LitElement {
  static override styles = styles;

  @property({reflect: true})
  position = TooltipPosition.Bottom;

  @property({reflect: true})
  alignement = TooltipAlignment.Center;

  @state()
  target!: Element;
  @property({reflect: true, type: Boolean})
  show = false;

  horizontalOffset = 10;
  verticalOffset = 10;
  override connectedCallback(): void {
    super.connectedCallback();
    this.target = this.previousElementSibling!;
    this.target.addEventListener('mouseover', this.onMouseOver);
    this.target.addEventListener('mouseleave', this.onMouseLeave);
  }

  private onMouseOver = () => {
    this.show = true;
  };
  private onMouseLeave = () => {
    this.show = false;
    this.style.top = EMPTY_STRING;
    this.style.left = EMPTY_STRING;
    this.style.width = EMPTY_STRING;
    this.classList.remove(...this.classList.values());
  };

  override updated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    if (this.show) this.calculatePosition();
  }

  private calculatePosition = () => {
    this.style.width = `${this.clientWidth}px`;
    if (this.position == TooltipPosition.Bottom || this.position == TooltipPosition.Top) {
      this.calculateYposition();
      this.calculateYalignement();
    } else {
      this.calculateXposition();
      this.calculateXalignement();
    }
  };
  private calculateYposition = () => {
    const targetRect = this.target.getBoundingClientRect();
    const targetWithTopSpaceHeight = targetRect.bottom;
    const topAvailableSpace = targetRect.top;
    const totalViewPortHeight = window.visualViewport!.height;
    const tooltipHeight = this.clientHeight;
    const isAvailableBottomSpace = tooltipHeight + this.verticalOffset < totalViewPortHeight - targetWithTopSpaceHeight;
    const isAvailableTopSpace = tooltipHeight + this.verticalOffset < topAvailableSpace;

    if (this.position == TooltipPosition.Bottom) {
      if (isAvailableBottomSpace || !isAvailableTopSpace) {
        this.classList.add('bottom-position');
        this.style.top = `${targetWithTopSpaceHeight + this.verticalOffset}px`;
      } else {
        this.classList.add('top-position');
        this.style.top = `${topAvailableSpace - tooltipHeight - this.verticalOffset}px`;
      }
    } else {
      if (isAvailableTopSpace || !isAvailableBottomSpace) {
        this.classList.add('top-position');
        this.style.top = `${topAvailableSpace - tooltipHeight - this.verticalOffset}px`;
      } else {
        this.classList.add('bottom-position');
        this.style.top = `${targetWithTopSpaceHeight + this.verticalOffset}px`;
      }
    }
  };
  private calculateYalignement = () => {
    const targetRect = this.target.getBoundingClientRect();
    const leftSpaceAndTargetWidth = targetRect.right;
    const targetWidth = targetRect.width;
    const leftSpace = targetRect.left;
    const tooltipWidth = this.clientWidth;
    const leftSpaceAndHalfOfTargetWidth = leftSpace + targetWidth / 2;
    const totalViewPortWidth = window.visualViewport!.width;
    const rightSpaceAndHalfOfTargetWidth = totalViewPortWidth - leftSpaceAndTargetWidth + targetWidth / 2;

    if (this.alignement == TooltipAlignment.Start) {
      const canBeAtStart = tooltipWidth + leftSpace < totalViewPortWidth;
      if (canBeAtStart) {
        this.classList.add('alignement-start');
        this.style.left = `${leftSpace - this.horizontalOffset}px`;
      } else {
        this.classList.add('alignement-end');
        this.style.left = `${leftSpace - tooltipWidth + this.horizontalOffset}px`;
      }
    } else if (this.alignement == TooltipAlignment.End) {
      const canBeAtEnd = tooltipWidth < leftSpace;
      if (canBeAtEnd) {
        this.classList.add('alignement-end');
        this.style.left = `${leftSpace - tooltipWidth + this.horizontalOffset}px`;
      } else {
        this.classList.add('alignement-start');
        this.style.left = `${leftSpace - this.horizontalOffset}px`;
      }
    } else {
      const canBeCentered =
        (tooltipWidth / 2 < leftSpaceAndHalfOfTargetWidth && tooltipWidth / 2 < rightSpaceAndHalfOfTargetWidth) ||
        (tooltipWidth > leftSpaceAndHalfOfTargetWidth && tooltipWidth > rightSpaceAndHalfOfTargetWidth);
      const canBeAtEnd = tooltipWidth < leftSpaceAndHalfOfTargetWidth;
      if (canBeCentered) {
        this.classList.add('alignement-center');
        this.style.left = `${leftSpace - tooltipWidth / 2 + targetWidth / 2}px`;
      } else if (canBeAtEnd) {
        this.classList.add('alignement-end');
        this.style.left = `${leftSpace - tooltipWidth + this.horizontalOffset}px`;
      } else {
        this.classList.add('alignement-start');
        this.style.left = `${leftSpace - this.horizontalOffset}px`;
      }
    }
  };
  private calculateXposition = () => {
    const targetRect = this.target.getBoundingClientRect();
    const leftSpace = targetRect.left;
    const leftSpaceAndTargetWidth = targetRect.right;
    const totalViewPortWidth = window.visualViewport!.width;
    const tooltipWidth = this.clientWidth;
    const isAvailableRightSpace = tooltipWidth + this.horizontalOffset < totalViewPortWidth - leftSpaceAndTargetWidth;
    const isAvailableLeftSpace = tooltipWidth + this.horizontalOffset < leftSpace;

    if (this.position == TooltipPosition.Right) {
      if (isAvailableRightSpace || !isAvailableLeftSpace) {
        this.classList.add('right-position');
        this.style.left = `${leftSpaceAndTargetWidth + this.horizontalOffset}px`;
      } else {
        this.classList.add('left-position');
        this.style.left = `${leftSpace - tooltipWidth - this.horizontalOffset}px`;
      }
    } else {
      if (isAvailableLeftSpace || !isAvailableRightSpace) {
        this.classList.add('left-position');
        this.style.left = `${leftSpace - tooltipWidth - this.horizontalOffset}px`;
      } else {
        this.classList.add('right-position');
        this.style.left = `${leftSpaceAndTargetWidth + this.horizontalOffset}px`;
      }
    }
  };
  private calculateXalignement = () => {
    const targetRect = this.target.getBoundingClientRect();
    const topSpace = targetRect.top;
    const targetHeight = targetRect.height;
    const targetWithTopSpaceHeight = targetRect.bottom;
    const tooltipHeight = this.clientHeight;
    const totalViewPortHeight = window.visualViewport!.height;
    const bottomSpace = totalViewPortHeight - targetWithTopSpaceHeight;

    if (this.alignement == TooltipAlignment.End) {
      const canBeAtEnd = tooltipHeight < topSpace;
      if (canBeAtEnd) {
        this.classList.add('alignement-end');
        this.style.top = `${targetWithTopSpaceHeight - tooltipHeight}px`;
      } else {
        this.classList.add('alignement-start');
        this.style.top = `${topSpace - targetHeight / 4}px`;
      }
    } else if (this.alignement == TooltipAlignment.Start) {
      const canBeAtStart = tooltipHeight < totalViewPortHeight - targetWithTopSpaceHeight;
      if (canBeAtStart) {
        this.classList.add('alignement-start');
        this.style.top = `${topSpace - targetHeight / 4}px`;
      } else {
        this.classList.add('alignement-end');
        this.style.top = `${targetWithTopSpaceHeight - tooltipHeight}px`;
      }
    } else {
      const canBeCentered =
        (tooltipHeight / 2 < topSpace && tooltipHeight / 2 < bottomSpace) ||
        (tooltipHeight > topSpace && tooltipHeight > bottomSpace);
      const canBeAtEnd = tooltipHeight < topSpace;
      if (canBeCentered) {
        this.classList.add('alignement-center');
        this.style.top = `${topSpace + targetHeight / 2 - tooltipHeight / 2}px`;
      } else if (canBeAtEnd) {
        this.classList.add('alignement-end');
        this.style.top = `${targetWithTopSpaceHeight - tooltipHeight}px`;
      } else {
        this.classList.add('alignement-start');
        this.style.top = `${topSpace - targetHeight / 4}px`;
      }
    }
  };
  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.target.removeEventListener('mouseover', this.onMouseOver);
    this.target.removeEventListener('mouseleave', this.onMouseLeave);
  }

  override render() {
    return this.show ? html`<slot></slot> ` : nothing;
  }
}
