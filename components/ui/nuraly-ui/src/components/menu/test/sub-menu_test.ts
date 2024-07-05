import {html, fixture, expect} from '@open-wc/testing';
import {HySubMenu} from '../templates/hy-sub-menu';
import '../templates/hy-sub-menu';

suite('HySubMenuComponent', () => {
  test('init sub menu', async () => {
    const text = 'link';
    const icon = 'bomb';
    const el: HySubMenu = await fixture(html`<hy-sub-menu text=${text} icon=${icon}></hy-sub-menu>`);
    const toggleIcon = el.shadowRoot?.querySelector('#toggle-icon');
    const textContainer = el.shadowRoot!.querySelector('span')!;
    const textIcon = el.shadowRoot?.querySelector('#text-icon');
    expect(el.disabled).to.be.false;
    expect(el.highlighted).to.be.false;
    expect(el.text).to.equal(text);
    expect(el.icon).to.equal(icon);
    expect(el.isOpen).to.be.false;
    expect(toggleIcon).to.have.attribute('name', 'angle-down');
    expect(textContainer.textContent).to.equal(text);
    expect(textIcon).to.have.attribute('name', icon);
  });

  test('toggle sub menu', async () => {
    const el: HySubMenu = await fixture(html`<hy-sub-menu></hy-sub-menu>`);
    const container = el.shadowRoot!.querySelector('div')!;
    const toggleIcon = el.shadowRoot?.querySelector('#toggle-icon');
    container.click();
    await el.updateComplete;
    expect(el.isOpen).to.be.true;
    expect(toggleIcon).to.have.attribute('name', 'angle-up');
    container.click();
    await el.updateComplete;
    expect(el.isOpen).to.be.false;
    expect(toggleIcon).to.have.attribute('name', 'angle-down');
  });

  test('disabled sub menu', async () => {
    const el: HySubMenu = await fixture(html`<hy-sub-menu disabled=${true}></hy-sub-menu>`);
    const container = el.shadowRoot!.querySelector('div')!;
    expect(el.disabled).to.be.true;
    container.click();
    await el.updateComplete;
    expect(el.isOpen).to.be.false;
  });

  test('sub menu with text only', async () => {
    const text = 'sub menu text';
    const el: HySubMenu = await fixture(html`<hy-sub-menu text="${text}"></hy-sub-menu>`);
    const icon = el.shadowRoot!.querySelector('#text-icon');
    const textContainer = el.shadowRoot!.querySelector('span')!;
    expect(icon).to.not.exist;
    expect(textContainer.textContent).to.equal(text);
  });

  test('highlight sub menu', async () => {
    const el: HySubMenu = await fixture(html`<hy-sub-menu></hy-sub-menu>`);
    let eventDispatched = false;
    el.addEventListener('init-highlighted', () => {
      eventDispatched = true;
    });
    expect(el.highlighted).to.be.false;

    el._handleSelectedChild();

    expect(eventDispatched).to.be.true;
    expect(el.highlighted).to.be.true;
  });
});
