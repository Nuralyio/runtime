/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {HyButtonElement} from '../hy-button.component';
import {sendMouse} from '@web/test-runner-commands';

import {fixture, assert} from '@open-wc/testing';
import {html} from 'lit/static-html.js';
import {getMiddleOfElement} from '../../../helpers/test';

/*const button = el.shadowRoot!.querySelector('button')!;
    assert.equal(getComputedStyle(button).borderColor, '16px');*/
suite('hy-button', () => {
  test('is defined', () => {
    const el = document.createElement('hy-button');
    assert.instanceOf(el, HyButtonElement);
  });

  test('renders with default values', async () => {
    const el = await fixture(html`<hy-button>button</hy-button>`);
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
  const DANGER_BUTTON_BACKGOURND_COLOR = 'rgb(255, 74, 0)';
  const DANGER_BUTTON_BACKGOURND_HOVER_COLOR = 'rgb(237, 81, 81)';
  test('renders danger button', async () => {
    const el = await fixture(html`<hy-button type="danger">button</hy-button>`);
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
      html`<hy-button type="dashed">dashed button</hy-button>`
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

  const PRIMARY_BUTTON_BACKGOURND_COLOR = 'rgb(18, 119, 225)';
  const PRIMARY_BUTTON_BACKGOURND_HOVER_COLOR = 'rgb(10, 112, 255)';
  test('renders primary button', async () => {
    const el = await fixture(
      html`<hy-button type="primary">primary button</hy-button>`
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

  const DISABLED_BUTTON_BACKGOURND_COLOR = 'rgb(204, 204, 204)';
  const DISABLED_BUTTON_BACKGOURND_HOVER_COLOR = 'rgb(204, 204, 204)';

  test('renders primary button', async () => {
    const el = await fixture(
      html`<hy-button disabled>disabled button</hy-button>`
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

  const TEXT_BUTTON_BACKGOURND_COLOR = 'rgb(249, 249, 249)';
  const TEXT_BUTTON_BACKGOURND_HOVER_COLOR = 'rgb(225, 225, 225)';

  test('renders primary button', async () => {
    const el = await fixture(
      html`<hy-button type="text">disabled button</hy-button>`
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

  const LINK_BUTTON_COLOR = 'rgb(22, 119, 255)';
  const LINK_BUTTON_HOVER_COLOR = 'rgb(74, 150, 255)';
  const LINK_BUTTON_BACKGOURND_COLOR = 'rgba(0, 0, 0, 0)';
  const LINK_BUTTON_BACKGOURND_HOVER_COLOR = 'rgb(249, 249, 249)';

  test('renders link button', async () => {
    const el = await fixture(
      html`<hy-button type="link">link button</hy-button>`
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

  test('renders icon only button', async () => {
    const el = await fixture(html`<hy-button icon="user"></hy-button>`);
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

  test('renders icon only button', async () => {
    const el = await fixture(
      html`<hy-button icon="user" shape="circle"></hy-button>`
    );
    assert.shadowDom.equal(
      el,
      `
      <button data-type="default" class="icon-only rounded" >
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

    assert.equal(getComputedStyle(button).borderRadius, '50%');

    const slot = el.shadowRoot!.querySelector('slot')?.assignedNodes()[0];
    assert.isUndefined(slot?.textContent);
  });

  test('renders link button', async () => {
    const el = await fixture(
      html`<hy-button loading>loading button</hy-button>`
    );
    assert.shadowDom.equal(
      el,
      `
      <button data-type="default" data-state="loading" >
        <slot id="slot">
        </slot>
       </button>
    `
    );

    const button = el.shadowRoot!.querySelector('button')!;

    assert.equal(getComputedStyle(button).opacity, '0.5');

    const slot = el.shadowRoot!.querySelector('slot')?.assignedNodes()[0];
    assert.equal(slot?.textContent, 'loading button');
  });

  test('renders block button', async () => {
    const el = await fixture(html`<hy-button block>block button</hy-button>`);
    assert.shadowDom.equal(
      el,
      `
      <button data-display="block" data-type="default" >
        <slot id="slot">
        </slot>
       </button>
    `
    );

    const button = el.shadowRoot!.querySelector('button')!;

    assert.isAbove(parseInt(getComputedStyle(button).width), 100);

    const slot = el.shadowRoot!.querySelector('slot')?.assignedNodes()[0];
    assert.equal(slot?.textContent, 'block button');
  });
});
