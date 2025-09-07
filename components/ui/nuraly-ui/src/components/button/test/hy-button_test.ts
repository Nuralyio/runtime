import { html, fixture, expect } from '@open-wc/testing';
import { HyButtonElement } from '../hy-button.component';
import { ButtonSize, ButtonType, EMPTY_STRING } from '../hy-button.types.js';
import '../hy-button.component';

suite('HyButtonElement', () => {
  test('has default properties', async () => {
    const el: HyButtonElement = await fixture(html`<hy-button></hy-button>`);
    const button: HTMLButtonElement = el.shadowRoot!.querySelector('button')!;
    const icon = el.shadowRoot!.querySelector('hy-icon');

    expect(el.disabled).to.be.false;
    expect(el.loading).to.be.false;
    expect(el.size).to.equal(EMPTY_STRING);
    expect(el.type).to.equal(ButtonType.Default);
    expect(el.dashed).to.be.false;
    expect(el.icon).to.equal(EMPTY_STRING);
    expect(button).to.not.have.class('button-dashed');
    expect(button).to.not.have.attribute('data-size');
    expect(button).to.not.have.attribute('data-state');
    expect(button).to.have.attribute('data-type', ButtonType.Default);
    expect(button.disabled).to.be.false;
    expect(icon).to.not.exist;
  });

  test('has a label', async () => {
    const buttonLabel = 'Test content';
    const el: HyButtonElement = await fixture(html`<hy-button>${buttonLabel}</hy-button>`);
    const slot = el.shadowRoot!.querySelector('slot');
    const assignedNode = slot!.assignedNodes();
    expect(assignedNode[0].textContent).to.equal(buttonLabel);
  });
  test('fires onClick event when clicked', async () => {
    const el: HyButtonElement = await fixture(html`<hy-button></hy-button>`);
    const button = el.shadowRoot!.querySelector('button')!;
    let eventFired = false;
    el.addEventListener('click', () => {
      eventFired = true;
    });
    button.click();
    expect(eventFired).to.be.true;
  });

  test('has a disabled property on the button element', async () => {
    const el: HyButtonElement = await fixture(html`<hy-button disabled></hy-button>`);
    const button = el.shadowRoot!.querySelector('button')!;
    expect(button.disabled).to.be.true;
  });
  test('does not fire onClick event when disabled', async () => {
    const el: HyButtonElement = await fixture(html`<hy-button disabled></hy-button>`);
    const button = el.shadowRoot!.querySelector('button')!;
    let eventFired = false;
    el.addEventListener('click', () => {
      eventFired = true;
    });
    button.click();
    expect(eventFired).to.be.false;
  });

  test('renders the icon', async () => {
    const iconName = 'sample-icon';
    const el: HyButtonElement = await fixture(html`<hy-button icon=${iconName}></hy-button>`);
    const icon = el.shadowRoot!.querySelector('hy-icon');
    expect(icon).to.exist;
    expect(icon).to.have.attribute('name', iconName);
  });

  test('applies the correct classe for dashed', async () => {
    const el: HyButtonElement = await fixture(html`<hy-button dashed></hy-button>`);
    const button = el.shadowRoot!.querySelector('button');
    expect(button).to.have.class('button-dashed');
  });
  test('reflects the loading property as data-state on the button element', async () => {
    const el: HyButtonElement = await fixture(html`<hy-button loading></hy-button>`);
    const button = el.shadowRoot!.querySelector('button')!;
    expect(button).to.have.attribute('data-state', 'loading');
  });

  test('reflects the size property as data-size on the button element', async () => {
    const el: HyButtonElement = await fixture(html`<hy-button size=${ButtonSize.Large}></hy-button>`);
    const button = el.shadowRoot!.querySelector('button')!;
    expect(button).to.have.attribute('data-size', ButtonSize.Large);
  });

  test('reflects the type property as data-type on the button element', async () => {
    const el: HyButtonElement = await fixture(html`<hy-button type=${ButtonType.Primary}></hy-button>`);
    const button = el.shadowRoot!.querySelector('button')!;
    expect(button).to.have.attribute('data-type', ButtonType.Primary);
  });
});
