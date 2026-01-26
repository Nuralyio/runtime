import { LitElement, css } from "lit";
import { property, state } from "lit/decorators.js";
import { $applicationComponents } from '@nuraly/runtime/redux/store';
import type { ComponentElement } from '@nuraly/runtime/redux/store';

export abstract class BasePropertyPanel extends LitElement {
  static override styles = css`
    :host { display: block; width: 100%; overflow-y: auto; }
    .empty-state { padding: 20px; text-align: center; color: #666; }
  `;

  @property({ type: Array }) componentIds: string[] = [];
  @property({ attribute: false }) component: any = null;
  @state() protected resolvedComponents: ComponentElement[] = [];

  private unsubscribe?: () => void;

  override connectedCallback() {
    super.connectedCallback();
    this.unsubscribe = $applicationComponents("1").subscribe(() => this.resolveComponents());
    this.resolveComponents();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribe?.();
  }

  override updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('componentIds')) this.resolveComponents();
  }

  protected resolveComponents(): void {
    const allComponents = $applicationComponents("1").get();
    this.resolvedComponents = this.componentIds
      .map(id => this.findComponentAndChildren(allComponents, id))
      .flat()
      .filter(Boolean) as ComponentElement[];
  }

  private findComponentAndChildren(allComponents: ComponentElement[], uuid: string): ComponentElement[] {
    const component = allComponents.find(c => c.uuid === uuid);
    if (!component) return [];
    const result = [component];
    if (component.children_ids?.length) {
      for (const childId of component.children_ids) {
        result.push(...this.findComponentAndChildren(allComponents, childId));
      }
    }
    return result;
  }
}
