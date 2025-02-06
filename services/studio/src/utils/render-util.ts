import { type ComponentElement, ComponentType } from "$store/component/interface";
import { html, type TemplateResult } from "lit";
import "@nuralyui/tooltips";
import "@shared/components/Tabs/Tabs";
import "@shared/components/Menu/Menu";
import "@shared/components/ColorPicker/colorpicker";
import "@shared/components/NumberInput/NumberInput";
import "@shared/components/TextInput/TextInput";
import "@shared/wrappers/GenerikWrapper/GenerikWrapper";
import "@shared/components/IconButton/iconbutton";
import "@shared/components/Select/Select";
import "../pages/app/studio/components/ControlPanel/Event/EventValue/EventValue";
import "@shared/components/Border/Border";
import "@shared/components/BoxShadow/BoxShadow";
import "@shared/components/Table/Table";
import "@shared/components/Checkbox/Checkbox";
import "@shared/components/DatePicker/DatePicker";
import "@shared/components/Icon/Icon";
import "@shared/components/Image/Image";
import "@shared/components/RadioButton/Radio-button";
import "@shared/components/AIChat/AIChat";
import "@shared/components/IconPicker/IconPicker";
import "@shared/components/MicroApp/MicroApp";
import "@shared/components/UsersDropdown/UsersDropdown";
import "@shared/components/InsertDropdown/InsertDropdown";
import "@shared/components/Collapse/Collapse";
import "@shared/components/Divider/Divider";
import "@shared/components/Handlers/Handlers";
import "@shared/components/Function/InvokeFunction.ts"
import "@shared/components/Export-Import/Export-Import.ts"
import "@shared/components/Collections/Collections.ts"
import "@shared/components/Button/Button.ts"
import "@shared/components/TextLabel/TextLabel.ts"

// Reusable templates for common components
const selectTemplate = (props: any, isViewMode: boolean)  => html`<select-block .isViewMode=${isViewMode} .item=${props.item} .component=${props.component}></select-block>`;
const iconButtonTemplate = (props: any, isViewMode: boolean)  => html`<icon-button-block .isViewMode=${isViewMode} .item=${props.item} .component=${props.component}></icon-button-block>`;
const colorPickerTemplate = (props: any, isViewMode: boolean)  => html`<color-picker-block .isViewMode=${isViewMode} .item=${props.item} .component=${props.component}></color-picker-block>`;
const numberInputTemplate = (props: any, isViewMode: boolean)  => html`<number-input-block .isViewMode=${isViewMode} .item=${props.item} .component=${props.component}></number-input-block>`;
const shadowBoxTemplate = (props: any, isViewMode: boolean)  => html`<attribute-box-shadow-value .isViewMode=${isViewMode} .item=${props.item} .component=${props.component}></attribute-box-shadow-value>`;
const borderRadiusTemplate = (props: any, isViewMode: boolean)  => html`<attribute-border-value .isViewMode=${isViewMode} .item=${props.item} .component=${props.component}></attribute-border-value>`;
const eventTemplate = (props: any, isViewMode: boolean)  => html`<parameter-event-handler .isViewMode=${isViewMode} .item=${props.item} .component=${props.component}></parameter-event-handler>`;
const tableTemplate = (props: any, isViewMode: boolean)  => html`<table-block .isViewMode=${isViewMode} .item=${props.item} .component=${props.component}></table-block>`;
const textInputTemplate = (props: any, isViewMode: boolean)  => html`<text-input-block .isViewMode=${isViewMode} .item=${props.item} .component=${props.component}></text-input-block>`;
const textLabelTemplate = (props: any, isViewMode: boolean)  => html`<text-label-block .isViewMode=${isViewMode} .item=${props.item} .component=${props.component}></text-label-block>`;
const buttonTemplate = (props: any, isViewMode: boolean)  => html`<button-block .isViewMode=${isViewMode} .item=${props.item} .component=${props.component}></button-block>`;
const tabsTemplate = (props: any, isViewMode: boolean)  => html`<tabs-block .isViewMode=${isViewMode} .item=${props.item} .component=${props.component}></tabs-block>`;
const menuTemplate = (props: any, isViewMode: boolean)  => html`<menu-block .isViewMode=${isViewMode} .item=${props.item} .component=${props.component}></menu-block>`;
const verticalContainerTemplate = (props: any, isViewMode: boolean) => html`<vertical-container-block .isViewMode=${isViewMode}  .item=${props.item} .component=${props.component}></vertical-container-block>`;
const collectionViewerTemplate = (props: any, isViewMode: boolean) => html`<collection-viewer .isViewMode=${isViewMode} .component=${props.component}></collection-viewer>`;
const checkboxTemplate = (props: any, isViewMode: boolean)  => html`<checkbox-block .isViewMode=${isViewMode} .item=${props.item} .component=${props.component}></checkbox-block>`;
const datePickerTemplate = (props: any, isViewMode: boolean)  => html`<date-picker-block .isViewMode=${isViewMode} .item=${props.item} .component=${props.component}></date-picker-block>`;
const iconTemplate = (props: any, isViewMode: boolean)  => html`<icon-block .isViewMode=${isViewMode} .item=${props.item} .component=${props.component}></icon-block>`;
const imageTemplate = (props: any, isViewMode: boolean)  => html`<image-block .isViewMode=${isViewMode} .item=${props.item} .component=${props.component}></image-block>`;
const radioButtonTemplate = (props: any, isViewMode: boolean)  => html`<radio-button-block .isViewMode=${isViewMode} .item=${props.item} .component=${props.component}></radio-button-block>`;
const aiTemplate = (props: any, isViewMode: boolean)  => html`<ai-chat-block .isViewMode=${isViewMode} .item=${props.item} .component=${props.component}></ai-chat-block>`;
const iconPickerTemplate = (props: any, isViewMode: boolean)  => html`<icon-picker-block .isViewMode=${isViewMode} .item=${props.item} .component=${props.component}></icon-picker-block>`;
const usersDropdownTemplate = (props: any, isViewMode: boolean)  => html`<users-dropdown-block .isViewMode=${isViewMode} .item=${props.item} .component=${props.component}></users-dropdown-block>`;
const insertDropdownTemplate = (props: any, isViewMode: boolean)  => html`<insert-dropdown-block .isViewMode=${isViewMode} .item=${props.item} .component=${props.component}></insert-dropdown-block>`;
const microAppTemplate = (props: any, isViewMode: boolean)  => html`<micro-app-block .isViewMode=${isViewMode} .item=${props.item} .component=${props.component}></micro-app-block>`;
const collapseTemplate = (props: any, isViewMode: boolean)  => html`<collapse-block .isViewMode=${isViewMode} .item=${props.item} .component=${props.component}></collapse-block>`;
const dividerTemplate = (props: any, isViewMode: boolean)  => html`<divider-block .isViewMode=${isViewMode} .item=${props.item} .component=${props.component}></divider-block>`;
const handlersTemplate = (props: any, isViewMode: boolean)  => html`<handler-block .isViewMode=${isViewMode} .item=${props.item} .component=${props.component}></handler-block>`;

const invokeFunctionTemplate = (props: any, isViewMode: boolean)  => html`
  <invoke-function-block .isViewMode=${isViewMode} .item=${props.item} .component=${props.component}></invoke-function-block>
`;


const importExportTemplate = (props: any, isViewMode: boolean)  => html`
  <export-import-block .isViewMode=${isViewMode} .item=${props.item} .component=${props.component}></export-import-block>
`;

function renderComponentElement(component: ComponentElement, commonProps: any, isViewMode?: boolean): TemplateResult {
  const template = getComponentTemplate(component, commonProps, isViewMode);

  if (isViewMode) {
    return html`${template}`;
  }

  return html`<generik-component-wrapper .component=${commonProps.component}>${template}</generik-component-wrapper>`;
}

function getComponentTemplate(component: ComponentElement, commonProps: any, isViewMode?: boolean): TemplateResult {
  switch (component?.component_type) {
    case ComponentType.Event:
      return eventTemplate(commonProps, isViewMode);
    case ComponentType.BorderRadius:
      return borderRadiusTemplate(commonProps, isViewMode);
    case ComponentType.ShadowBox:
      return shadowBoxTemplate(commonProps, isViewMode);
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
    case ComponentType.IconPicker:
      return iconPickerTemplate(commonProps, isViewMode);
    case ComponentType.MicroApp:
      return microAppTemplate(commonProps, isViewMode);
    case ComponentType.UsersDropdown:
      return usersDropdownTemplate(commonProps, isViewMode);
    case ComponentType.InsertDropdown:
      return insertDropdownTemplate(commonProps, isViewMode);
    case ComponentType.Collapse:
      return collapseTemplate(commonProps, isViewMode);
    case ComponentType.Handlers:
      return handlersTemplate(commonProps, isViewMode);
   case ComponentType.ExportImport:
      return importExportTemplate(commonProps, isViewMode);
    case ComponentType.InvokeFunction:
      return invokeFunctionTemplate(commonProps, isViewMode);
    default:
      return html``;
  }
}

export function renderComponent(components: ComponentElement[], item?: any, isViewMode?: boolean): TemplateResult {
  if (!components || !components.length) return html``;
  return html`
    ${components.map((component: ComponentElement) => {
    const commonProps = { item: { ...item }, component };
    return renderComponentElement(component, commonProps, isViewMode);
  })}
  `;
}