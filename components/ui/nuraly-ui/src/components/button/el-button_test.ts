/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {ElButtonElement} from './el-button.component';

import {fixture, assert} from '@open-wc/testing';
import {html} from 'lit/static-html.js';

suite('el-button', () => {
  test('is defined', () => {
    const el = document.createElement('el-button');
    assert.instanceOf(el, ElButtonElement);
  });

  test('renders with default values', async () => {
    const el = await fixture(html`<el-button type="danger">button</el-button>`);
    assert.shadowDom.equal(
      el,
      `
      <button
        data-type="danger">
        <slot id="slot">
        </slot>
       </button>
    `
    );
    /*const button = el.shadowRoot!.querySelector('button')!;
    assert.equal(getComputedStyle(button).borderColor, '16px');*/
  });

  /* test('renders with a set name', async () => {
    const el = await fixture(html`<el-button name="Test"></el-button>`);
    assert.shadowDom.equal(
      el,
      `
      <h1>Hello, Test!</h1>
      <button part="button">Click Count: 0</button>
      <slot></slot>
    `
    );
  });

  test('handles a click', async () => {
    const el = (await fixture(html`<el-button></el-button>`)) as MyElement;
    const button = el.shadowRoot!.querySelector('button')!;
    button.click();
    await el.updateComplete;
    assert.shadowDom.equal(
      el,
      `
      <h1>Hello, World!</h1>
      <button part="button">Click Count: 1</button>
      <slot></slot>
    `
    );
  });

  test('styling applied', async () => {
    const el = (await fixture(html`<el-button></el-button>`)) as MyElement;
    await el.updateComplete;
    assert.equal(getComputedStyle(el).paddingTop, '16px');
  });*/
});
