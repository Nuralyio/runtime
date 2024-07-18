import { type ComponentElement, ComponentType } from "$store/component/interface";
import { html, nothing, type TemplateResult } from "lit";
import '../components/shared/blocks/ComponentElements/Tabs/Tabs';
import '../components/shared/blocks/ComponentElements/Menu/Menu';
import '../components/shared/blocks/ComponentElements/ColorPicker/colorpicker'
import'../components/shared/blocks/ComponentElements/NumberInput/NumberInput'
import '../components/shared/blocks/ComponentWrappers/GenerikWrapper/GenerikWrapper';
import '../components/shared/blocks/ComponentElements/IconButton/iconbutton'
// Simple memoization cache
const renderCache = new Map<string, TemplateResult>();

function getCacheKey(components: ComponentElement[], item: any, isViewMode: boolean): string {
  return JSON.stringify({ components, item, isViewMode });
}

export function renderComponent(components: ComponentElement[], item?: any, isViewMode?: boolean): TemplateResult {
  if (!components || !components.length) return html``;

  const cacheKey = getCacheKey(components, item, isViewMode);
  // if (renderCache.has(cacheKey)) {
  //   return renderCache.get(cacheKey)!;
  // }

  const renderedTemplate = html`
    ${components.map((component: ComponentElement) => {
      const commonProps = { item: { ...item }, component: { ...component } };
      switch (component?.component_type) {
        case ComponentType.IconButton:
          return html`
            ${html`<icon-button-block  .item=${commonProps.item}  .component=${commonProps.component}></icon-button-block>`}
          `;
        case ComponentType.ColorPicker:
          return html`
            ${html`<color-picker-block  .item=${commonProps.item}  .component=${commonProps.component}></color-picker-block>`}
          `;
          
        case ComponentType.NumberInput:
          return html`
             ${ html`<number-input-block  .item=${commonProps.item}  .component=${commonProps.component}></number-input-block>`}`;
                
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
            <menu-block style="width:100%;" .item=${commonProps.item} .component=${commonProps.component}></menu-block>
          ` : html``;

        default:
          return html``;
      }
    })}
  `;

  renderCache.set(cacheKey, renderedTemplate);
  return renderedTemplate;
}