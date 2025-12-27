import { type ComponentElement, ComponentType } from '../redux/store/component/component.interface';
import { html, type TemplateResult } from "lit";
import { ComponentRegistry, type ComponentRenderProps } from './component-registry';

const selectTemplate = (props: any, isViewMode: boolean)  => html`<select-block .isViewMode=${isViewMode} .parentcomponent=${props.parent} .item=${props.item} .component=${props.component}></select-block>`;
const iconButtonTemplate = (props: any, isViewMode: boolean)  => html`<icon-button-block .isViewMode=${isViewMode} .parentcomponent=${props.parent} .item=${props.item} .component=${props.component}></icon-button-block>`;
const colorPickerTemplate = (props: any, isViewMode: boolean)  => html`<color-picker-block .isViewMode=${isViewMode} .parentcomponent=${props.parent} .item=${props.item} .component=${props.component}></color-picker-block>`;
const numberInputTemplate = (props: any, isViewMode: boolean)  => html`<number-input-block .isViewMode=${isViewMode} .parentcomponent=${props.parent} .item=${props.item} .component=${props.component}></number-input-block>`;
const tableTemplate = (props: any, isViewMode: boolean)  => html`<table-block .isViewMode=${isViewMode} .parentcomponent=${props.parent} .item=${props.item} .component=${props.component}></table-block>`;
const textInputTemplate = (props: any, isViewMode: boolean)  => html`<text-input-block .isViewMode=${isViewMode} .parentcomponent=${props.parent} .item=${props.item} .component=${props.component}></text-input-block>`;
const textLabelTemplate = (props: any, isViewMode: boolean)  => html`<text-label-block .isViewMode=${isViewMode} .parentcomponent=${props.parent} .item=${props.item} .component=${props.component}></text-label-block>`;
const buttonTemplate = (props: any, isViewMode: boolean)  => html`<button-block .isViewMode=${isViewMode} .parentcomponent=${props.parent} .item=${props.item} .component=${props.component}></button-block>`;
const tabsTemplate = (props: any, isViewMode: boolean)  => html`<tabs-block .isViewMode=${isViewMode} .parentcomponent=${props.parent} .item=${props.item} .component=${props.component}></tabs-block>`;
const menuTemplate = (props: any, isViewMode: boolean)  => html`<menu-block .isViewMode=${isViewMode} .parentcomponent=${props.parent} .item=${props.item} .component=${props.component}></menu-block>`;
const verticalContainerTemplate = (props: any, isViewMode: boolean) => html`<vertical-container-block .isViewMode=${isViewMode} .parentcomponent=${props.parent} .item=${props.item} .component=${props.component}></vertical-container-block>`;
const collectionViewerTemplate = (props: any, isViewMode: boolean) => html`<collection-viewer .isViewMode=${isViewMode} .parentcomponent=${props.parent} .component=${props.component}></collection-viewer>`;
const checkboxTemplate = (props: any, isViewMode: boolean)  => html`<checkbox-block .isViewMode=${isViewMode} .parentcomponent=${props.parent} .item=${props.item} .component=${props.component}></checkbox-block>`;
const datePickerTemplate = (props: any, isViewMode: boolean)  => html`<date-picker-block .isViewMode=${isViewMode} .parentcomponent=${props.parent} .item=${props.item} .component=${props.component}></date-picker-block>`;
const iconTemplate = (props: any, isViewMode: boolean)  => html`<icon-block .isViewMode=${isViewMode} .parentcomponent=${props.parent} .item=${props.item} .component=${props.component}></icon-block>`;
const imageTemplate = (props: any, isViewMode: boolean)  => html`<image-block .isViewMode=${isViewMode} .parentcomponent=${props.parent} .item=${props.item} .component=${props.component}></image-block>`;
const radioButtonTemplate = (props: any, isViewMode: boolean)  => html`<radio-button-block .isViewMode=${isViewMode} .parentcomponent=${props.parent} .item=${props.item} .component=${props.component}></radio-button-block>`;
const aiTemplate = (props: any, isViewMode: boolean)  => html`<ai-chat-block .isViewMode=${isViewMode} .parentcomponent=${props.parent} .item=${props.item} .component=${props.component}></ai-chat-block>`;
const microAppTemplate = (props: any, isViewMode: boolean)  => html`<micro-app-block .isViewMode=${isViewMode} .parentcomponent=${props.parent} .item=${props.item} .component=${props.component}></micro-app-block>`;
const collapseTemplate = (props: any, isViewMode: boolean)  => html`<collapse-block .isViewMode=${isViewMode} .parentcomponent=${props.parent} .item=${props.item} .component=${props.component}></collapse-block>`;
const dividerTemplate = (props: any, isViewMode: boolean)  => html`<divider-block .isViewMode=${isViewMode} .parentcomponent=${props.parent} .item=${props.item} .component=${props.component}></divider-block>`;
const dropDownTemplate = (props: any, isViewMode: boolean)  => html`<dropdown-block .isViewMode=${isViewMode} .parentcomponent=${props.parent} .item=${props.item} .component=${props.component}></dropdown-block>`;
const refComponentTemplate = (props: any, isViewMode: boolean)  => html`<ref-component-container-block .isViewMode=${isViewMode} .parentcomponent=${props.parent} .item=${props.item} .component=${props.component}></ref-component-container-block>`;
const codeTemplate = (props: any, isViewMode: boolean)  => html`<code-block .isViewMode=${isViewMode} .parentcomponent=${props.parent} .item=${props.item} .component=${props.component}></code-block>`;
const richTextTemplate = (props: any, isViewMode: boolean)  => html`<rich-text-block .isViewMode=${isViewMode} .parentcomponent=${props.parent} .item=${props.item} .component=${props.component}></rich-text-block>`;
const embedURLTemplate = (props: any, isViewMode: boolean)  => html`<embed-url-block .isViewMode=${isViewMode} .parentcomponent=${props.parent} .item=${props.item} .component=${props.component}></embed-url-block>`;
const linkTemplate = (props: any, isViewMode: boolean)  => html`<link-block .isViewMode=${isViewMode} .parentcomponent=${props.parent} .item=${props.item} .component=${props.component}></link-block>`;
const fileUploadTemplate = (props: any, isViewMode: boolean)  => html`<file-upload-block .isViewMode=${isViewMode} .parentcomponent=${props.parent} .item=${props.item} .component=${props.component}></file-upload-block>`;
const videoTemplate = (props: any, isViewMode: boolean)  => html`<video-block .isViewMode=${isViewMode} .parentcomponent=${props.parent} .item=${props.item} .component=${props.component}></video-block>`;
const documentTemplate = (props: any, isViewMode: boolean)  => html`<document-block .isViewMode=${isViewMode} .parentcomponent=${props.parent} .item=${props.item} .component=${props.component}></document-block>`;
const textareaTemplate = (props: any, isViewMode: boolean)  => html`<textarea-block .isViewMode=${isViewMode} .parentcomponent=${props.parent} .item=${props.item} .component=${props.component}></textarea-block>`;
const badgeTemplate = (props: any, isViewMode: boolean)  => html`<badge-block .isViewMode=${isViewMode} .parentcomponent=${props.parent} .item=${props.item} .component=${props.component}></badge-block>`;
const cardTemplate = (props: any, isViewMode: boolean)  => html`<card-block .isViewMode=${isViewMode} .parentcomponent=${props.parent} .item=${props.item} .component=${props.component}></card-block>`;
const tagTemplate = (props: any, isViewMode: boolean)  => html`<tag-block .isViewMode=${isViewMode} .parentcomponent=${props.parent} .item=${props.item} .component=${props.component}></tag-block>`;
const sliderTemplate = (props: any, isViewMode: boolean)  => html`<slider-block .isViewMode=${isViewMode} .parentcomponent=${props.parent} .item=${props.item} .component=${props.component}></slider-block>`;
const panelTemplate = (props: any, isViewMode: boolean)  => html`<panel-block .isViewMode=${isViewMode} .parentcomponent=${props.parent} .item=${props.item} .component=${props.component}></panel-block>`;
const gridRowTemplate = (props: any, isViewMode: boolean)  => html`<grid-row-block .isViewMode=${isViewMode} .parentcomponent=${props.parent} .item=${props.item} .component=${props.component}></grid-row-block>`;
const gridColTemplate = (props: any, isViewMode: boolean)  => html`<grid-col-block .isViewMode=${isViewMode} .parentcomponent=${props.parent} .item=${props.item} .component=${props.component}></grid-col-block>`;
const flexTemplate = (props: any, isViewMode: boolean)  => html`<flex-block .isViewMode=${isViewMode} .parentcomponent=${props.parent} .item=${props.item} .component=${props.component}></flex-block>`;
const formTemplate = (props: any, isViewMode: boolean)  => html`<form-block .isViewMode=${isViewMode} .parentcomponent=${props.parent} .item=${props.item} .component=${props.component}></form-block>`;

function renderComponentElement(component: ComponentElement, commonProps: any, isViewMode?: boolean): TemplateResult {
  const template = getComponentTemplate(component, commonProps, isViewMode);
  return html`${template}`;
}

function getComponentTemplate(component: ComponentElement, commonProps: any, isViewMode?: boolean): TemplateResult {
  switch (component?.component_type) {
    case ComponentType.Select:
      return selectTemplate(commonProps, isViewMode);
    case ComponentType.IconButton:
      return iconButtonTemplate(commonProps, isViewMode);
    case ComponentType.ColorPicker:
      return colorPickerTemplate(commonProps, isViewMode);
    case ComponentType.NumberInput:
      return numberInputTemplate(commonProps, isViewMode);
    case ComponentType.TextInput:
      return textInputTemplate(commonProps, isViewMode);
    case ComponentType.TextLabel:
      return textLabelTemplate(commonProps, isViewMode);
    case ComponentType.Button:
      return buttonTemplate(commonProps, isViewMode);
    case ComponentType.Tabs:
      return tabsTemplate(commonProps, isViewMode);
    case ComponentType.Menu:
      return menuTemplate(commonProps, isViewMode);
    case ComponentType.Table:
      return tableTemplate(commonProps, isViewMode);
    case ComponentType.Container:
      return verticalContainerTemplate(commonProps, isViewMode);
    case ComponentType.Collection:
      return collectionViewerTemplate(commonProps, isViewMode);
    case ComponentType.Checkbox:
      return checkboxTemplate(commonProps, isViewMode);
    case ComponentType.DatePicker:
      return datePickerTemplate(commonProps, isViewMode);
    case ComponentType.Divider:
      return dividerTemplate(commonProps, isViewMode);
    case ComponentType.Icon:
      return iconTemplate(commonProps, isViewMode);
    case ComponentType.Image:
      return imageTemplate(commonProps, isViewMode);
    case ComponentType.RadioButton:
      return radioButtonTemplate(commonProps, isViewMode);
    case ComponentType.AI:
      return aiTemplate(commonProps, isViewMode);
    case ComponentType.MicroApp:
      return microAppTemplate(commonProps, isViewMode);
    case ComponentType.Collapse:
      return collapseTemplate(commonProps, isViewMode);
    case ComponentType.Dropdown:
      return dropDownTemplate(commonProps, isViewMode);
    case ComponentType.RefComponent:
      return refComponentTemplate(commonProps, isViewMode);
    case ComponentType.Code:
      return codeTemplate(commonProps, isViewMode);
    case ComponentType.RichText:
      return richTextTemplate(commonProps, isViewMode);
    case ComponentType.EmbedURL:
      return embedURLTemplate(commonProps, isViewMode);
    case ComponentType.Link:
      return linkTemplate(commonProps, isViewMode);
    case ComponentType.FileUpload:
      return fileUploadTemplate(commonProps, isViewMode);
    case ComponentType.Video:
      return videoTemplate(commonProps, isViewMode);
    case ComponentType.Document:
      return documentTemplate(commonProps, isViewMode);
    case ComponentType.Textarea:
      return textareaTemplate(commonProps, isViewMode);
    case ComponentType.Badge:
      return badgeTemplate(commonProps, isViewMode);
    case ComponentType.Card:
      return cardTemplate(commonProps, isViewMode);
    case ComponentType.Tag:
      return tagTemplate(commonProps, isViewMode);
    case ComponentType.Slider:
      return sliderTemplate(commonProps, isViewMode);
    case ComponentType.Panel:
      return panelTemplate(commonProps, isViewMode);
    case ComponentType.GridRow:
      return gridRowTemplate(commonProps, isViewMode);
    case ComponentType.GridCol:
      return gridColTemplate(commonProps, isViewMode);
    case ComponentType.Flex:
      return flexTemplate(commonProps, isViewMode);
    case ComponentType.Form:
      return formTemplate(commonProps, isViewMode);
    default:
      const registeredTemplate = ComponentRegistry.getTemplate(component?.component_type as string);
      if (registeredTemplate) {
        const renderProps: ComponentRenderProps = {
          component: commonProps.component,
          parent: commonProps.parent,
          item: commonProps.item,
        };
        return registeredTemplate(renderProps, isViewMode ?? false);
      }
      return html``;
  }
}

export function renderComponent(components: ComponentElement[], item?: any, isViewMode?: boolean, parent?:ComponentElement ): TemplateResult {
  if (!components || !components.length) return html``;

  return html`
    ${components.map((component: ComponentElement) => {
    const commonProps = { item: { ...item }, component , parent : { ...parent } };
    return renderComponentElement(component, commonProps, isViewMode );
  })}
  `;
}