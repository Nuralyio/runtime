import {html, fixture, expect, oneEvent} from '@open-wc/testing';
import {HyMenuComponent} from '../menu.component';
import '../menu.component';

suite('HyDropdownComponent', () => {
  test('should instantiate the component', async () => {
    const el = await fixture(html`<hy-menu></hy-menu>`);
    expect(el).to.be.an.instanceOf(HyMenuComponent);
  });

  test('should render the menu button with initial state', async () => {
    const el: HyMenuComponent = await fixture(html`<hy-menu></hy-menu>`);
    expect(el.shadowRoot!.querySelector('.menu')).not.to.be.null;
    expect(el.open).to.be.false;
  });

  test('should open/close the menu', async () => {
    const el: HyMenuComponent = await fixture(html`<hy-menu></hy-menu>`);
    el.toggleDropdown();
    expect(el.open).to.be.true;
    el.toggleDropdown();
    expect(el.open).to.be.false;
  });

  test('should select an option and dispatch a change event', async () => {
    const el: HyMenuComponent = await fixture(html`<hy-menu></hy-menu>`);
    const option = {label: 'Option 1', value: 1};
    setTimeout(() => el.handleSelect(option, {stopPropagation: () => {}}));
    const {detail} = await oneEvent(el, 'change');
    expect(detail.value).to.equal(option);
  });

  test.skip('should render the parent option with nested options', async () => {
    const nestedOption = {
      label: 'Parent',
      children: [{label: 'Child 1'}, {label: 'Child 2'}],
    };

    const el: HyMenuComponent = await fixture(html` <hy-menu .options=${[nestedOption]}></hy-menu> `);
    const parentOption = el.shadowRoot!.querySelector('.menu-content ul li');
    expect(parentOption).not.to.be.null;
    expect(parentOption?.querySelector('.nested')).not.to.be.null;
  });

  test('should select a nested option and dispatch a change event', async () => {
    const nestedOption = {
      label: 'Parent',
      children: [{label: 'Child 1'}, {label: 'Child 2'}],
    };

    const el: HyMenuComponent = await fixture(html` <hy-menu .options=${[nestedOption]}></hy-menu> `);
    const childOption = {label: 'Child 1'};
    setTimeout(() => el.handleSelect(childOption, {stopPropagation: () => {}}));
    const {detail} = await oneEvent(el, 'change');
    expect(detail.value).to.equal(childOption);
  });
});
