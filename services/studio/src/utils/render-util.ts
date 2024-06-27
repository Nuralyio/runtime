import { type ComponentElement, ComponentType } from "$store/component/interface";
import { html, type TemplateResult } from "lit";
import '../components/shared/blocks/ComponentElements/Tabs/Tabs';
import '../components/shared/blocks/ComponentElements/Menu/Menu';
import '../components/shared/blocks/ComponentWrappers/GenerikWrapper/GenerikWrapper';
// Simple memoization cache
const renderCache = new Map<string, TemplateResult>();

function getCacheKey(components: ComponentElement[], item: any, isViewMode: boolean): string {
  return JSON.stringify({ components, item, isViewMode });
}

export function renderComponent(components: ComponentElement[], item?: any, isViewMode?: boolean): TemplateResult {
  console.log("renderComponent", components, item, isViewMode)
  if (!components || !components.length) return html``;

  const cacheKey = getCacheKey(components, item, isViewMode);
  // if (renderCache.has(cacheKey)) {
  //   return renderCache.get(cacheKey)!;
  // }

  const renderedTemplate = html`
    ${components.map((component: ComponentElement) => {
      const commonProps = { item: { ...item }, component: { ...component } };
      
      switch (component?.component_type) {
        case ComponentType.TextInput:
          return html`
           ${isViewMode
              ? html`<text-input-block .item=${commonProps.item} .component=${{...commonProps.component}}></text-input-block>`
              : html`<generik-component-wrapper .component=${commonProps.component}><text-input-block .item=${commonProps.item} .component=${{...commonProps.component}}></text-input-block></generik-component-wrapper>`
            }
          `;

        case ComponentType.TextLabel:
          return html`
            <generik-component-wrapper .component=${{...commonProps.component}}>
              <text-label-block .item=${commonProps.item} .component=${{...commonProps.component}}></text-label-block>
            </generik-component-wrapper>
          `;

        case ComponentType.Button:
          return html`
            ${isViewMode
              ? html`<button-block .item=${commonProps.item} .component=${commonProps.component}></button-block>`
              : html`<generik-component-wrapper .component=${commonProps.component}></generik-component-wrapper>`
            }
          `;

        case ComponentType.VerticalContainer:
          return html`
            <vertical-container-block .isViewMode=${isViewMode} .item=${commonProps.item} .component=${commonProps.component}></vertical-container-block>
          `;

        case ComponentType.Collection:
          return html`
            <colletion-viwer .isViewMode=${isViewMode} .component=${commonProps.component}></colletion-viwer>
          `;

        case ComponentType.Tabs:
          return isViewMode ? html`
            <tabs-block .item=${commonProps.item} .component=${commonProps.component}></tabs-block>
          ` : html``;
          case ComponentType.Menu:
          return isViewMode ? html`
            <menu-block .item=${commonProps.item} .component=${commonProps.component}></menu-block>
          ` : html``;

        default:
          return html``;
      }
    })}
  `;

  renderCache.set(cacheKey, renderedTemplate);
  return renderedTemplate;
}