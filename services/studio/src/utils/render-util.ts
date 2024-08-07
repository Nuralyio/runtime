import { type ComponentElement, ComponentType } from "$store/component/interface";
import { html, type TemplateResult } from "lit";
import '../components/shared/blocks/components/Tabs/Tabs';
import '../components/shared/blocks/components/Menu/Menu';
import '../components/shared/blocks/components/ColorPicker/colorpicker';
import '../components/shared/blocks/components/NumberInput/NumberInput';
import '../components/shared/blocks/wrappers/GenerikWrapper/GenerikWrapper';
import '../components/shared/blocks/components/IconButton/iconbutton'
import '../components/shared/blocks/components/Select/Select'
import '../components/pages/studio/ControlPanel/Event/EventValue/EventValue'
// Simple memoization cache

// Memoization cache using WeakMap for better memory management
const renderCache = new WeakMap<ComponentElement[], Map<string, TemplateResult>>();

// Reusable templates for common components
const selectTemplate = (props: any) => html`<select-block .item=${props.item} .component=${props.component}></select-block>`;
const iconButtonTemplate = (props: any) => html`<icon-button-block .item=${props.item} .component=${props.component}></icon-button-block>`;
const colorPickerTemplate = (props: any) => html`<color-picker-block .item=${props.item} .component=${props.component}></color-picker-block>`;
const numberInputTemplate = (props: any) => html`<number-input-block .item=${props.item} .component=${props.component}></number-input-block>`;
const shadowBoxTemplate = (props:any)=>html`<attribute-box-shadow-value .item=${props.item}  .component=${props.component}></box-shadow-value-block >`
const borderRadiusTemplate = (props:any)=>html`<attribute-border-value .item=${props.item}  .component=${props.component}></attribute-border-value >`
const eventTemplate =(props:any)=>html`<parameter-event-handler .item=${props.item}  .component=${props.component}></parameter-event-handler>`
function renderComponentElement(component: ComponentElement, commonProps: any, isViewMode?: boolean): TemplateResult {
  switch (component?.component_type) {
    case ComponentType.Event:
      return eventTemplate(commonProps);
    case ComponentType.BorderRadius:
      return borderRadiusTemplate(commonProps);
    case ComponentType.ShadowBox:
      return shadowBoxTemplate(commonProps);
    case ComponentType.Select:
      return selectTemplate(commonProps);
    case ComponentType.IconButton:
      return iconButtonTemplate(commonProps);
    case ComponentType.ColorPicker:
      return colorPickerTemplate(commonProps);
    case ComponentType.NumberInput:
      return numberInputTemplate(commonProps);
    case ComponentType.TextInput:
      return isViewMode
        ? html`<text-input-block .item=${commonProps.item} .component=${commonProps.component}></text-input-block>`
        : html`<generik-component-wrapper .component=${commonProps.component}><text-input-block .item=${commonProps.item} .component=${commonProps.component}></text-input-block></generik-component-wrapper>`;
    case ComponentType.TextLabel:
      return isViewMode? html`
      <text-label-block .item=${commonProps.item} .component=${commonProps.component}></text-label-block>
      `:html`<generik-component-wrapper .component=${commonProps.component}>
            <text-label-block .item=${commonProps.item} .component=${commonProps.component}></text-label-block>

      </generik-component-wrapper>`
    case ComponentType.Button:
      return isViewMode
        ? html`<button-block .item=${commonProps.item} .component=${commonProps.component}></button-block>`
        : html`<generik-component-wrapper .component=${commonProps.component}></generik-component-wrapper>`;
    case ComponentType.VerticalContainer:
      return html`<vertical-container-block .isViewMode=${isViewMode} .item=${commonProps.item} .component=${commonProps.component}></vertical-container-block>`;
    case ComponentType.Collection:
      return html`<collection-viewer .isViewMode=${isViewMode} .component=${commonProps.component}></collection-viewer>`;
    case ComponentType.Tabs:
      return isViewMode ? html`<tabs-block .item=${commonProps.item} .component=${commonProps.component}></tabs-block>` : html``;
    case ComponentType.Menu:
      return isViewMode ? html`<menu-block style="width:100%;" .item=${commonProps.item} .component=${commonProps.component}></menu-block>` : html``;
    default:
      return html``;
  }
}

export function renderComponent(components: ComponentElement[], item?: any, isViewMode?: boolean): TemplateResult {
  if (!components || !components.length) return html``;

  let componentCache = renderCache.get(components);
  if (!componentCache) {
    componentCache = new Map();
    renderCache.set(components, componentCache);
  }

  const cacheKey = JSON.stringify({ item, isViewMode });
  let renderedTemplate = componentCache.get(cacheKey);

  if (!renderedTemplate) {
    renderedTemplate = html`
      ${components.map((component: ComponentElement) => {
      const commonProps = { item: { ...item }, component };
      return renderComponentElement(component, commonProps, isViewMode);
    })}
    `;
    componentCache.set(cacheKey, renderedTemplate);
  }

  return renderedTemplate;
}