import { type ComponentElement, ComponentType } from "$store/component/interface";
import { html, type TemplateResult } from "lit";
import '../components/shared/blocks/components/Tabs/Tabs';
import '../components/shared/blocks/components/Menu/Menu';
import '../components/shared/blocks/components/ColorPicker/colorpicker';
import '../components/shared/blocks/components/NumberInput/NumberInput';
import '../components/shared/blocks/wrappers/GenerikWrapper/GenerikWrapper';
import '../components/shared/blocks/components/IconButton/iconbutton';
import '../components/shared/blocks/components/Select/Select';
import '../components/pages/studio/ControlPanel/Event/EventValue/EventValue';
import '../components/shared/blocks/components/Table/Table';
import '../components/shared/blocks/components/Checkbox/Checkbox'; // Add this import

// Simple memoization cache

// Memoization cache using WeakMap for better memory management
const renderCache = new WeakMap<ComponentElement[], Map<string, TemplateResult>>();

// Reusable templates for common components
const selectTemplate = (props: any) => html`<select-block .item=${props.item} .component=${props.component}></select-block>`;
const iconButtonTemplate = (props: any) => html`<icon-button-block .item=${props.item} .component=${props.component}></icon-button-block>`;
const colorPickerTemplate = (props: any) => html`<color-picker-block .item=${props.item} .component=${props.component}></color-picker-block>`;
const numberInputTemplate = (props: any) => html`<number-input-block .item=${props.item} .component=${props.component}></number-input-block>`;
const shadowBoxTemplate = (props: any) => html`<attribute-box-shadow-value .item=${props.item} .component=${props.component}></attribute-box-shadow-value>`;
const borderRadiusTemplate = (props: any) => html`<attribute-border-value .item=${props.item} .component=${props.component}></attribute-border-value>`;
const eventTemplate = (props: any) => html`<parameter-event-handler .item=${props.item} .component=${props.component}></parameter-event-handler>`;
const tableTemplate = (props: any) => html`<table-block .item=${props.item} .component=${props.component}></table-block>`;
const textInputTemplate = (props: any) => html`<text-input-block .item=${props.item} .component=${props.component}></text-input-block>`;
const textLabelTemplate = (props: any) => html`<text-label-block .item=${props.item} .component=${props.component}></text-label-block>`;
const buttonTemplate = (props: any) => html`<button-block .item=${props.item} .component=${props.component}></button-block>`;
const tabsTemplate = (props: any) => html`<tabs-block .item=${props.item} .component=${props.component}></tabs-block>`;
const menuTemplate = (props: any) => html`<menu-block .item=${props.item} .component=${props.component}></menu-block>`;
const verticalContainerTemplate = (props: any, isViewMode: boolean) => html`<vertical-container-block .isViewMode=${isViewMode} .item=${props.item} .component=${props.component}></vertical-container-block>`;
const collectionViewerTemplate = (props: any, isViewMode: boolean) => html`<collection-viewer .isViewMode=${isViewMode} .component=${props.component}></collection-viewer>`;
const checkboxTemplate = (props: any) => html`<checkbox-block .item=${props.item} .component=${props.component}></checkbox-block>`; // Add this template

function renderComponentElement(component: ComponentElement, commonProps: any, isViewMode?: boolean): TemplateResult {
  const template = getComponentTemplate(component, commonProps, isViewMode);

  if (isViewMode) {
    return template;
  }

  return html`<generik-component-wrapper .component=${commonProps.component}>${template}</generik-component-wrapper>`;
}

function getComponentTemplate(component: ComponentElement, commonProps: any, isViewMode?: boolean): TemplateResult {
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
      return textInputTemplate(commonProps);
    case ComponentType.TextLabel:
      return textLabelTemplate(commonProps);
    case ComponentType.Button:
      return buttonTemplate(commonProps);
    case ComponentType.Tabs:
      return tabsTemplate(commonProps);
    case ComponentType.Menu:
      return menuTemplate(commonProps);
    case ComponentType.Table:
      return tableTemplate(commonProps);
    case ComponentType.VerticalContainer:
      return verticalContainerTemplate(commonProps, isViewMode);
    case ComponentType.Collection:
      return collectionViewerTemplate(commonProps, isViewMode);
    case ComponentType.Checkbox: // Add this case
      return checkboxTemplate(commonProps);
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
