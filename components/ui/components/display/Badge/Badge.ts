import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { BaseElementBlock } from "../../base/BaseElement.ts";
import { ref } from "lit/directives/ref.js";

import "@nuralyui/badge";

@customElement("badge-block")
export class BadgeBlock extends BaseElementBlock {
  static styles = [css``];

  @property({ type: Object })
  component: ComponentElement;

  @property({ type: Object })
  item: any;

  renderComponent() {
    const badgeStyles = this.component?.style || {};
    
    // Get properties from input or inputHandlers
    const count = this.component?.input?.count?.value ?? this.resolvedInputs?.count;
    const text = this.component?.input?.text?.value || this.resolvedInputs?.text || '';
    const dot = this.component?.input?.dot?.value ?? this.resolvedInputs?.dot ?? false;
    const showZero = this.component?.input?.showZero?.value ?? this.resolvedInputs?.showZero ?? false;
    const overflowCount = this.component?.input?.overflowCount?.value || this.resolvedInputs?.overflowCount || 99;
    
    // Get styling properties
    const size = this.component?.input?.size?.value || this.resolvedInputs?.size || 'default';
    const color = this.component?.input?.color?.value || this.resolvedInputs?.color;
    const status = this.component?.input?.status?.value || this.resolvedInputs?.status;
    const ribbon = this.component?.input?.ribbon?.value || this.resolvedInputs?.ribbon;
    const ribbonPlacement = this.component?.input?.ribbonPlacement?.value || this.resolvedInputs?.ribbonPlacement || 'end';
    
    // Get offset
    const offsetX = this.component?.input?.offsetX?.value || this.resolvedInputs?.offsetX;
    const offsetY = this.component?.input?.offsetY?.value || this.resolvedInputs?.offsetY;
    const offset: [number, number] | undefined = offsetX || offsetY ? [offsetX || 0, offsetY || 0] : undefined;

    return html`
      <nr-badge
        ${ref(this.inputRef)}
        style=${styleMap(badgeStyles)}
        .count=${count}
        .text=${text}
        .size=${size}
        .color=${color}
        .status=${status}
        .ribbon=${ribbon}
        .ribbonPlacement=${ribbonPlacement}
        .overflowCount=${overflowCount}
        .offset=${offset}
        ?dot=${dot}
        ?showZero=${showZero}
      >
        <slot></slot>
      </nr-badge>
    `;
  }
}
