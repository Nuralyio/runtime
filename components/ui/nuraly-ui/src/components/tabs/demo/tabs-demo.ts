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

  protected override render() {
    return html`
      <hy-tabs>
        <div label="Tab 1">Content for Tab 1</div>
        <div label="Tab 2">Content for Tab 2</div>
        <div label="Tab 3">Content for Tab 3</div>
      </hy-tabs>
      <br />
      <br />
      <hy-tabs
        activeTab=${this.editableActiveTab}
        .editable=${{
          canDeleteTab: true,
          canEditTabTitle: true,
          canAddTab: true,
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
          console.log(e.detail.index);
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
      <hy-tabs
        activeTab=${this.editableActiveTab}
        .editable=${{
          canEditTabTitle: true,
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
