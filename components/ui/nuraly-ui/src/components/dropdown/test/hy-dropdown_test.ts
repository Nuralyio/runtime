import {html, fixture, expect, oneEvent} from '@open-wc/testing';
import {HyDropdownComponent} from '../hy-dropdown.component';
import '../hy-dropdown.component';

suite('HyDropdownComponent', () => {
  test('should instantiate the component', async () => {
    const el = await fixture(html`<hy-dropdown></hy-dropdown>`);
    expect(el).to.be.an.instanceOf(HyDropdownComponent);
  });

  test('should render the dropdown button with initial state', async () => {
    const el: HyDropdownComponent = await fixture(html`<hy-dropdown></hy-dropdown>`);
    expect(el.shadowRoot!.querySelector('.dropdown')).not.to.be.null;
    expect(el.open).to.be.false;
  });

  test('should open/close the dropdown', async () => {
    const el: HyDropdownComponent = await fixture(html`<hy-dropdown></hy-dropdown>`);
    el.toggleDropdown();
    expect(el.open).to.be.true;
    el.toggleDropdown();
    expect(el.open).to.be.false;
  });

  test('should select an option and dispatch a change event', async () => {
    const el: HyDropdownComponent = await fixture(html`<hy-dropdown></hy-dropdown>`);
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

    const el: HyDropdownComponent = await fixture(html` <hy-dropdown .options=${[nestedOption]}></hy-dropdown> `);
    const parentOption = el.shadowRoot!.querySelector('.dropdown-content ul li');
    expect(parentOption).not.to.be.null;
    expect(parentOption?.querySelector('.nested')).not.to.be.null;
  });

  test('should select a nested option and dispatch a change event', async () => {
    const nestedOption = {
      label: 'Parent',
      children: [{label: 'Child 1'}, {label: 'Child 2'}],
    };

    const el: HyDropdownComponent = await fixture(html` <hy-dropdown .options=${[nestedOption]}></hy-dropdown> `);
    const childOption = {label: 'Child 1'};
    setTimeout(() => el.handleSelect(childOption, {stopPropagation: () => {}}));
    const {detail} = await oneEvent(el, 'change');
    expect(detail.value).to.equal(childOption);
  });
});
