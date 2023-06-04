import {html, fixture, oneEvent, expect} from '@open-wc/testing';
import {HyButtonElement} from '../hy-button.component';
import '../hy-button.component';

suite('HyButtonElement', () => {
  test('has a default empty display property', async () => {
    const el: HyButtonElement = await fixture(html`<hy-button></hy-button>`);
    await el.updateComplete;
    expect(el.display).to.equal('');
  });

  test('can set display property', async () => {
    const el: HyButtonElement = await fixture(html`<hy-button display="block"></hy-button>`);
    await el.updateComplete;
    expect(el.display).to.equal('block');
  });

  test('renders the icon', async () => {
    const el: HyButtonElement = await fixture(html`<hy-button icon="sample-icon"></hy-button>`);
    await el.updateComplete;
    const icon = el.shadowRoot!.querySelector('hy-icon');
    expect(icon).to.exist;
    expect(icon?.getAttribute('name')).to.equal('sample-icon');
  });

  test('renders slot content', async () => {
    const el: HyButtonElement = await fixture(html`<hy-button>Test content</hy-button>`);
    await el.updateComplete;
  });

  test('reflects the disabled property on the button element', async () => {
    const el: HyButtonElement = await fixture(html`<hy-button disabled></hy-button>`);
    await el.updateComplete;
    const button = el.shadowRoot!.querySelector('button');
    expect(button?.hasAttribute('disabled')).to.be.true;
  });

  test('reflects the loading property as data-state on the button element', async () => {
    const el: HyButtonElement = await fixture(html`<hy-button loading></hy-button>`);
    await el.updateComplete;
    const button = el.shadowRoot!.querySelector('button');
    expect(button?.getAttribute('data-state')).to.equal('loading');
  });

  test('sets the danger property as data-danger on the button element', async () => {
    const el: HyButtonElement = await fixture(html`<hy-button danger></hy-button>`);
    await el.updateComplete;
    const button = el.shadowRoot!.querySelector('button');
    expect(button?.getAttribute('data-danger')).to.equal('');
  });

  test('fires onClick event when clicked', async () => {
    const el: HyButtonElement = await fixture(html`<hy-button></hy-button>`);
    await el.updateComplete;
    const button = el.shadowRoot!.querySelector('button');
    setTimeout(() => button?.click());
    const {detail} = await oneEvent(el, 'click');
    expect(detail).to.exist;
  });

  test('does not fire onClick event when disabled', async () => {
    const el: HyButtonElement = await fixture(html`<hy-button disabled></hy-button>`);
    await el.updateComplete;
    const button = el.shadowRoot!.querySelector('button');
    let eventFired = false;
    el.addEventListener('click', () => {
      eventFired = true;
    });
    button?.click();
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(eventFired).to.be.false;
  });

  test('applies the correct classes for shape and content', async () => {
    const el: HyButtonElement = await fixture(html`<hy-button shape="circle"></hy-button>`);
    await el.updateComplete;
    const button = el.shadowRoot!.querySelector('button');
    expect(button?.classList.contains('button-rounded')).to.be.true;
  });

  test('applies the correct classes for icon-only buttons', async () => {
    const el: HyButtonElement = await fixture(html`<hy-button icon="sample-icon"></hy-button>`);
    await el.updateComplete;
    const button = el.shadowRoot!.querySelector('button');
    expect(button?.classList.contains('icon-only')).to.be.true;
  });
});
