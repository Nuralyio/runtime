import { type ComponentElement, ComponentType } from "$store/component/interface";
import { html, type TemplateResult } from "lit";
import "@nuralyui/tooltips"
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
const checkboxTemplate = (props: any) => html`<checkbox-block .item=${props.item} .component=${props.component}></checkbox-block>`;
const datePickerTemplate = (props: any) => html`<date-picker-block .item=${props.item} .component=${props.component}></date-picker-block>`;
const iconTemplate = (props: any) => html`<icon-block .item=${props.item} .component=${props.component}></icon-block>`;
const imageTemplate = (props: any) => html`<image-block .item=${props.item} .component=${props.component}></image-block>`; // Add this template
const radioButtonTemplate = (props: any) => html`<radio-button-block .item=${props.item} .component=${props.component}></radio-button-block>`;
const aiTemplate = (props: any) => html`<ai-chat-block .item=${props.item} .component=${props.component}></ai-chat-block>`; // Add this template
const iconPickerTemplate = (props: any) => html`<icon-picker-block .item=${props.item} .component=${props.component}></icon-picker-block>`;
const usersDropdownTemplate = (props: any) => html`<users-dropdown-block .item=${props.item} .component=${props.component}></users-dropdown-block>`;
const insertDropdownTemplate = (props: any) => html`<insert-dropdown-block .item=${props.item} .component=${props.component}></insert-dropdown-block>`;
const microAppTemplate = (props: any) => html`<micro-app-block .item=${props.item} .component=${props.component}></micro-app-block>`; // Add this template
const collapseTemplate = (props: any) => html`<collapse-block .item=${props.item} .component=${props.component}></collapse-block>`;
const dividerTemplate = (props: any) => html`<divider-block .item=${props.item} .component=${props.component}></divider-block>`;
const handlersTemplate = (props: any) => html`<handler-block .item=${props.item} .component=${props.component}></handler-block>`;
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
    case ComponentType.Checkbox:
      return checkboxTemplate(commonProps);
    case ComponentType.DatePicker:
      return datePickerTemplate(commonProps);
    case ComponentType.Divier:
      return dividerTemplate(commonProps);
    case ComponentType.Icon:
      return iconTemplate(commonProps);
    case ComponentType.Image:
      return imageTemplate(commonProps);
    case ComponentType.RadioButton:
      return radioButtonTemplate(commonProps);
    case ComponentType.AI:
      return aiTemplate(commonProps);
    case ComponentType.IconPicker:
      return iconPickerTemplate(commonProps);
    case ComponentType.MicroApp:
      return microAppTemplate(commonProps);
    case ComponentType.UsersDropdown:
        return usersDropdownTemplate(commonProps);
    case ComponentType.InsertDropdown:
        return insertDropdownTemplate(commonProps);
    case ComponentType.Collapse:
        return collapseTemplate(commonProps);
    case ComponentType.Handlers:
      return handlersTemplate(commonProps);

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
