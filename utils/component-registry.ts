import { html, type TemplateResult } from "lit";
import type { ComponentElement } from "../redux/store/component/component.interface";

export interface ComponentRenderProps {
  component: ComponentElement;
  parent: ComponentElement;
  item: any;
}

export type ComponentTemplateFunction = (
  props: ComponentRenderProps,
  isViewMode: boolean
) => TemplateResult;

export interface ComponentRegistrationOptions {
  type: string;
  tagName: string;
  template?: ComponentTemplateFunction;
  componentClass?: CustomElementConstructor;
  displayName?: string;
  category?: string;
  icon?: string;
  defaultInputs?: Record<string, any>;
}

export interface RegisteredComponent {
  type: string;
  tagName: string;
  template: ComponentTemplateFunction;
  displayName?: string;
  category?: string;
  icon?: string;
  defaultInputs?: Record<string, any>;
}

class ComponentRegistryImpl {
  private registry: Map<string, RegisteredComponent> = new Map();

  register(options: ComponentRegistrationOptions): void {
    const { type, tagName, componentClass, template } = options;

    if (this.registry.has(type)) {
      console.warn(`[ComponentRegistry] Component type "${type}" is already registered. Skipping.`);
      return;
    }

    if (componentClass && !customElements.get(tagName)) {
      customElements.define(tagName, componentClass);
    }

    const componentTemplate = template ?? this.createDefaultTemplate(tagName);

    this.registry.set(type, {
      type,
      tagName,
      template: componentTemplate,
      displayName: options.displayName,
      category: options.category,
      icon: options.icon,
      defaultInputs: options.defaultInputs,
    });
  }

  unregister(type: string): boolean {
    return this.registry.delete(type);
  }

  getTemplate(type: string): ComponentTemplateFunction | undefined {
    return this.registry.get(type)?.template;
  }

  get(type: string): RegisteredComponent | undefined {
    return this.registry.get(type);
  }

  has(type: string): boolean {
    return this.registry.has(type);
  }

  getAll(): RegisteredComponent[] {
    return Array.from(this.registry.values());
  }

  getByCategory(category: string): RegisteredComponent[] {
    return this.getAll().filter((c) => c.category === category);
  }

  clear(): void {
    this.registry.clear();
  }

  private createDefaultTemplate(tagName: string): ComponentTemplateFunction {
    return (props: ComponentRenderProps, isViewMode: boolean) => {
      const el = document.createElement(tagName);
      (el as any).isViewMode = isViewMode;
      (el as any).parentcomponent = props.parent;
      (el as any).item = props.item;
      (el as any).component = props.component;
      return html`${el}`;
    };
  }
}

export const ComponentRegistry = new ComponentRegistryImpl();

export function registerComponent(
  type: string,
  tagName: string,
  componentClass?: CustomElementConstructor
): void {
  ComponentRegistry.register({ type, tagName, componentClass });
}

export function registerComponents(
  components: ComponentRegistrationOptions[]
): void {
  components.forEach((options) => ComponentRegistry.register(options));
}
