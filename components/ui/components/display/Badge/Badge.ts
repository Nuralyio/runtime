import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { BaseElementBlock } from "../../base/BaseElement.ts";
import { ref } from "lit/directives/ref.js";

// Safely import @nuralyui/badge
try {
  await import("@nuralyui/badge");
} catch (error) {
  console.warn('[@nuralyui/badge] Package not found or failed to load.');
}


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
    const count = this.component?.input?.count?.value ?? this.inputHandlersValue?.count;
    const text = this.component?.input?.text?.value || this.inputHandlersValue?.text || '';
    const dot = this.component?.input?.dot?.value ?? this.inputHandlersValue?.dot ?? false;
    const showZero = this.component?.input?.showZero?.value ?? this.inputHandlersValue?.showZero ?? false;
    const overflowCount = this.component?.input?.overflowCount?.value || this.inputHandlersValue?.overflowCount || 99;
    
    // Get styling properties
    const size = this.component?.input?.size?.value || this.inputHandlersValue?.size || 'default';
    const color = this.component?.input?.color?.value || this.inputHandlersValue?.color;
    const status = this.component?.input?.status?.value || this.inputHandlersValue?.status;
    const ribbon = this.component?.input?.ribbon?.value || this.inputHandlersValue?.ribbon;
    const ribbonPlacement = this.component?.input?.ribbonPlacement?.value || this.inputHandlersValue?.ribbonPlacement || 'end';
    
    // Get offset
    const offsetX = this.component?.input?.offsetX?.value || this.inputHandlersValue?.offsetX;
    const offsetY = this.component?.input?.offsetY?.value || this.inputHandlersValue?.offsetY;
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
