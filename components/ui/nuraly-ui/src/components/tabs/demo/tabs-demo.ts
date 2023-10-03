/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import {LitElement, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';

import '../tabs.component';

import '../../icon';
@customElement('hy-tabs-demo')
export class ElMeenuElement extends LitElement {
  @state()
  float = 'left';

  @state()
  editableTabs = [
    {
      label: 'Tab 1',
      content: html`Content for Tab 1`,
    },
    {
      label: 'Tab 2',
      content: html`Content for Tab 2`,
    },
    {
      label: 'Tab 3',
      content: html`Content for Tab 3`,
    },
  ];

  @state()
  editableActiveTab = 0;

  @state()
  orientation = 'horizontal';

  @state()
  editableConfig = {
    canDeleteTab: false,
    canEditTabTitle: false,
    canAddTab: true,
    canMove: true,
  };

  swapElements(arr: any, index1: any, index2: any) {
    const temp = arr[index1];
    arr[index1] = arr[index2];
    arr[index2] = temp;
    return arr;
  }

  protected override render() {
    return html`
      <hy-tabs>
        <div label="Tab 1">Content for Tab 1</div>
        <div label="Tab 2">Content for Tab 2</div>
        <div label="Tab 3">Content for Tab 3</div>
      </hy-tabs>
      <br />
      <button
        @click=${() => {
          this.editableConfig.canDeleteTab = !this.editableConfig?.canDeleteTab;
          this.requestUpdate();
          this.editableConfig = {...this.editableConfig};
        }}
      >
        ${this.editableConfig?.canDeleteTab ? 'Disable delete' : 'Enable delete'} mode
      </button>
      <button
        @click=${() => {
          this.editableConfig.canEditTabTitle = !this.editableConfig?.canEditTabTitle;
          this.requestUpdate();
          this.editableConfig = {...this.editableConfig};
        }}
      >
        ${this.editableConfig?.canEditTabTitle ? 'Disable edition' : 'Enable edition'} mode
      </button>
      <button
        @click=${() => {
          this.orientation = this.orientation === 'vertical' ? 'horizontal' : 'vertical';
        }}
      >
        ${this.orientation == 'vertical' ? 'vertical' : 'horizontal'} mode
      </button>
      <br />
      <hy-tabs
        .tabs=${this.editableTabs}
        .orientation=${this.orientation}
        @tabOrderChange=${(e: any) => {
          this.editableTabs = this.swapElements(this.editableTabs, e.detail.sourceIndex, e.detail.targetIndex);
          this.editableTabs = [...this.editableTabs];
        }}
        activeTab=${this.editableActiveTab}
        .editable=${{
          ...this.editableConfig,
        }}
        @addTab=${() => {
          this.editableTabs.push({
            label: 'Tab ' + (this.editableTabs.length + 1),
            content: html`Content for Tab ${this.editableTabs.length + 1}`,
          });
          this.editableTabs = [...this.editableTabs];
          this.editableActiveTab = this.editableTabs.length - 1;
        }}
        @removeTab=${(e: any) => {
          this.editableTabs.splice(e.detail.index, 1);
          this.editableTabs = [...this.editableTabs];
        }}
        @tabEdited=${(e: any) => {
          const {tab} = e.detail;
          this.editableTabs[tab.index] = {
            ...this.editableTabs[tab.index],
            label: tab.label,
          };
        }}
      >
        ${this.editableTabs.map((tab: any) => {
          return html`<div label=${tab.label}>${tab.content}</div>`;
        })}
      </hy-tabs>
      <br />
      <br />
      <hy-tabs
        activeTab=${this.editableActiveTab}
        .editable=${{
          //canEditTabTitle: true,
          canAddTab: true,
          canMove: true,
        }}
        @tabEdited=${(e: CustomEvent) => {
          console.log('tab', e.detail.tab);
        }}
        @addTab=${() => {
          this.editableTabs.push({
            label: 'Tab ' + (this.editableTabs.length + 1),
            content: html`Content for Tab ${this.editableTabs.length + 1}`,
          });
          this.editableTabs = [...this.editableTabs];
          this.editableActiveTab = this.editableTabs.length - 1;
        }}
        @removeTab=${(e: any) => {
          this.editableTabs.splice(e.detail.index, 1);
        }}
      >
        ${this.editableTabs.map((tab: any) => {
          return html`<div label=${tab.label}>${tab.content}</div>`;
        })}
      </hy-tabs>
      <br />
      <br />
      <br />
      <hy-tabs
        activeTab=${this.editableActiveTab}
        .editable=${{
          canAddTab: true,
        }}
        @tabEdited=${(e: CustomEvent) => {
          console.log('tab', e.detail.tab);
        }}
        @addTab=${() => {
          this.editableTabs.push({
            label: 'Tab ' + (this.editableTabs.length + 1),
            content: html`Content for Tab ${this.editableTabs.length + 1}`,
          });
          this.editableTabs = [...this.editableTabs];
          this.editableActiveTab = this.editableTabs.length - 1;
        }}
        @removeTab=${(e: any) => {
          console.log(e);
          this.editableTabs.splice(e.detail.index, 1);
          this.editableTabs = [...this.editableTabs];
        }}
      >
        ${this.editableTabs.map((tab: any) => {
          return html`<div label=${tab.label}>${tab.content}</div>`;
        })}
      </hy-tabs>
      <br />
      <br />
      <br />
      <hy-tabs
        activeTab=${this.editableActiveTab}
        .editable=${{
          canDeleteTab: true,
        }}
        @tabEdited=${(e: CustomEvent) => {
          console.log('tab', e.detail.tab);
        }}
        @addTab=${() => {
          this.editableTabs.push({
            label: 'Tab ' + (this.editableTabs.length + 1),
            content: html`Content for Tab ${this.editableTabs.length + 1}`,
          });
          this.editableTabs = [...this.editableTabs];
          this.editableActiveTab = this.editableTabs.length - 1;
        }}
        @removeTab=${(e: any) => {
          this.editableTabs.splice(e.detail.index, 1);
        }}
      >
        ${this.editableTabs.map((tab: any) => {
          return html`<div label=${tab.label}>${tab.content}</div>`;
        })}
      </hy-tabs>
      <br />
      <br />
      <hy-tabs>
        <div label="Tab 1">Content for Tab 1</div>
        <div label="Tab 2">Content for Tab 2</div>
        <div label="Tab 3">Content for Tab 3</div>
      </hy-tabs>
      <br />
      <br />
      <br />
      <hy-tabs orientation="vertical">
        <div label="Tab 1">Content for Tab 1</div>
        <div label="Tab 2">Content for Tab 2</div>
        <div label="Tab 3">Content for Tab 3</div>
      </hy-tabs>
      <br />
      <br />
      <hy-tabs orientation="vertical" tabsAlign="right">
        <div label="Tab 1">Content for Tab 1</div>
        <div label="Tab 2">Content for Tab 2</div>
        <div label="Tab 3">Content for Tab 3</div>
      </hy-tabs>
      <br />
      <br />
      <hy-tabs tabsAlign="center">
        <div label="Tab 1">Content for Tab 1</div>
        <div label="Tab 2">Content for Tab 2</div>
        <div label="Tab 3">Content for Tab 3</div>
      </hy-tabs>
      <br />
      <br />
      <hy-tabs tabsAlign="right">
        <div label="Tab 1">Content for Tab 1</div>
        <div label="Tab 2">Content for Tab 2</div>
        <div label="Tab 3">Content for Tab 3</div>
      </hy-tabs>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'hy-tabs-demo': ElMeenuElement;
  }
}
