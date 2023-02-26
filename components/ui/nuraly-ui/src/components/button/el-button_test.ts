/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {ElButtonElement} from './el-button.component';
import {sendMouse} from '@web/test-runner-commands';

import {fixture, assert} from '@open-wc/testing';
import {html} from 'lit/static-html.js';
import {getMiddleOfElement} from '../../helpers/test';

/*const button = el.shadowRoot!.querySelector('button')!;
    assert.equal(getComputedStyle(button).borderColor, '16px');*/
suite('el-button', () => {
  test('is defined', () => {
    const el = document.createElement('el-button');
    assert.instanceOf(el, ElButtonElement);
  });

  test('renders with default values', async () => {
    const el = await fixture(html`<el-button>button</el-button>`);
    assert.shadowDom.equal(
      el,
      `
      <button data-type="default">
        <slot id="slot">
        </slot>
       </button>
    `
    );
    const slot = el.shadowRoot!.querySelector('slot')?.assignedNodes()[0];
    assert.equal(slot?.textContent, 'button');
  });

  //@TODO: danger
  const DANGER_BUTTON_BACKGOURND_COLOR = 'rgb(255, 23, 23)';
  const DANGER_BUTTON_BACKGOURND_HOVER_COLOR = 'rgb(237, 81, 81)';
  test('renders danger button', async () => {
    const el = await fixture(html`<el-button type="danger">button</el-button>`);
    assert.shadowDom.equal(
      el,
      `
      <button data-type="danger">
        <slot id="slot">
        </slot>
       </button>
    `
    );

    const button = el.shadowRoot!.querySelector('button')!;
    assert.equal(
      getComputedStyle(button).backgroundColor,
      DANGER_BUTTON_BACKGOURND_COLOR
    );
    const {x, y} = getMiddleOfElement(button);
    await sendMouse({type: 'move', position: [x, y]});

    assert.equal(
      getComputedStyle(button).backgroundColor,
      DANGER_BUTTON_BACKGOURND_HOVER_COLOR
    );
    assert.equal(getComputedStyle(button).cursor, 'pointer');

    const slot = el.shadowRoot!.querySelector('slot')?.assignedNodes()[0];
    assert.equal(slot?.textContent, 'button');
  });

  //@TODO: dashed
  test('renders dashed button', async () => {
    const el = await fixture(
      html`<el-button type="dashed">dashed button</el-button>`
    );
    assert.shadowDom.equal(
      el,
      `
      <button data-type="dashed">
        <slot id="slot">
        </slot>
       </button>
    `
    );

    const button = el.shadowRoot!.querySelector('button')!;
    assert.equal(getComputedStyle(button).borderBlockStyle, 'dashed');
    const {x, y} = getMiddleOfElement(button);
    await sendMouse({type: 'move', position: [x, y]});

    assert.equal(getComputedStyle(button).borderBlockStyle, 'dashed');
    assert.equal(getComputedStyle(button).cursor, 'pointer');

    const slot = el.shadowRoot!.querySelector('slot')?.assignedNodes()[0];
    assert.equal(slot?.textContent, 'dashed button');
  });
  //@TODO: primary

  const PRIMARY_BUTTON_BACKGOURND_COLOR = 'rgb(18, 62, 255)';
  const PRIMARY_BUTTON_BACKGOURND_HOVER_COLOR = 'rgb(10, 112, 255)';
  test('renders primary button', async () => {
    const el = await fixture(
      html`<el-button type="primary">primary button</el-button>`
    );
    assert.shadowDom.equal(
      el,
      `
      <button data-type="primary">
        <slot id="slot">
        </slot>
       </button>
    `
    );

    const button = el.shadowRoot!.querySelector('button')!;
    assert.equal(
      getComputedStyle(button).backgroundColor,
      PRIMARY_BUTTON_BACKGOURND_COLOR
    );
    const {x, y} = getMiddleOfElement(button);
    await sendMouse({type: 'move', position: [x, y]});

    assert.equal(
      getComputedStyle(button).backgroundColor,
      PRIMARY_BUTTON_BACKGOURND_HOVER_COLOR
    );
    assert.equal(getComputedStyle(button).cursor, 'pointer');

    const slot = el.shadowRoot!.querySelector('slot')?.assignedNodes()[0];
    assert.equal(slot?.textContent, 'primary button');
  });

  //@TODO: disabled

  const DISABLED_BUTTON_BACKGOURND_COLOR = 'rgb(204, 204, 204)';
  const DISABLED_BUTTON_BACKGOURND_HOVER_COLOR = 'rgb(204, 204, 204)';

  test('renders primary button', async () => {
    const el = await fixture(
      html`<el-button ?disabled="${true}">disabled button</el-button>`
    );
    assert.shadowDom.equal(
      el,
      `
      <button data-type="default" disabled>
        <slot id="slot">
        </slot>
       </button>
    `
    );

    const button = el.shadowRoot!.querySelector('button')!;
    assert.equal(
      getComputedStyle(button).backgroundColor,
      DISABLED_BUTTON_BACKGOURND_COLOR
    );
    const {x, y} = getMiddleOfElement(button);
    await sendMouse({type: 'move', position: [x, y]});

    assert.equal(
      getComputedStyle(button).backgroundColor,
      DISABLED_BUTTON_BACKGOURND_HOVER_COLOR
    );

    assert.equal(getComputedStyle(button).cursor, 'not-allowed');

    const slot = el.shadowRoot!.querySelector('slot')?.assignedNodes()[0];
    assert.equal(slot?.textContent, 'disabled button');
  });

  //@TODO: text

  const TEXT_BUTTON_BACKGOURND_COLOR = 'rgb(249, 249, 249)';
  const TEXT_BUTTON_BACKGOURND_HOVER_COLOR = 'rgb(225, 225, 225)';

  test('renders primary button', async () => {
    const el = await fixture(
      html`<el-button type="text">disabled button</el-button>`
    );
    assert.shadowDom.equal(
      el,
      `
      <button data-type="text" >
        <slot id="slot">
        </slot>
       </button>
    `
    );

    const button = el.shadowRoot!.querySelector('button')!;
    assert.equal(
      getComputedStyle(button).backgroundColor,
      TEXT_BUTTON_BACKGOURND_COLOR
    );
    const {x, y} = getMiddleOfElement(button);
    await sendMouse({type: 'move', position: [x, y]});

    assert.equal(
      getComputedStyle(button).backgroundColor,
      TEXT_BUTTON_BACKGOURND_HOVER_COLOR
    );

    assert.equal(getComputedStyle(button).cursor, 'pointer');

    const slot = el.shadowRoot!.querySelector('slot')?.assignedNodes()[0];
    assert.equal(slot?.textContent, 'disabled button');
  });

  //@TODO: link

  const LINK_BUTTON_COLOR = 'rgb(22, 119, 255)';
  const LINK_BUTTON_HOVER_COLOR = 'rgb(74, 150, 255)';
  const LINK_BUTTON_BACKGOURND_COLOR = 'rgba(0, 0, 0, 0)';
  const LINK_BUTTON_BACKGOURND_HOVER_COLOR = 'rgb(249, 249, 249)';

  test('renders link button', async () => {
    const el = await fixture(
      html`<el-button type="link">link button</el-button>`
    );
    assert.shadowDom.equal(
      el,
      `
      <button data-type="link" >
        <slot id="slot">
        </slot>
       </button>
    `
    );

    const button = el.shadowRoot!.querySelector('button')!;
    assert.equal(
      getComputedStyle(button).backgroundColor,
      LINK_BUTTON_BACKGOURND_COLOR
    );
    assert.equal(getComputedStyle(button).color, LINK_BUTTON_COLOR);
    const {x, y} = getMiddleOfElement(button);
    await sendMouse({type: 'move', position: [x, y]});

    assert.equal(
      getComputedStyle(button).backgroundColor,
      LINK_BUTTON_BACKGOURND_HOVER_COLOR
    );

    assert.equal(getComputedStyle(button).color, LINK_BUTTON_HOVER_COLOR);

    assert.equal(getComputedStyle(button).cursor, 'pointer');

    const slot = el.shadowRoot!.querySelector('slot')?.assignedNodes()[0];
    assert.equal(slot?.textContent, 'link button');
  });
  //@TODO: Icon

  test('renders icon only button', async () => {
    const el = await fixture(html`<el-button icon="user"></el-button>`);
    assert.shadowDom.equal(
      el,
      `
      <button data-type="default" class="icon-only" >
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.2/css/all.min.css"
        rel="stylesheet">
         <i class="fa fa-user">
       </i>
        <slot id="slot">
        </slot>
       </button>
    `
    );

    const button = el.shadowRoot!.querySelector('button')!;

    assert.equal(getComputedStyle(button).borderRadius, '4px');

    const slot = el.shadowRoot!.querySelector('slot')?.assignedNodes()[0];
    assert.isUndefined(slot?.textContent);
  });
  //@TODO: Icon cicle
  //@TODO: loading
  //@TODO: block

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
