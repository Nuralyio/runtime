import {html, fixture, expect} from '@open-wc/testing';
import '../hy-dropdown.component';
import {HyDropdownComponent} from '../hy-dropdown.component';
import {TriggerMode} from '../dropdown.types';
import {HyDropdownItem} from '../templates/hy-dropdown-item';
import '../templates/hy-dropdown-item';
import {HyDropdownMenu} from '../templates/hy-dropdown-menu';
import '../templates/hy-dropdown-menu';

const options = [
  {label: 'option1', value: 'value1'},
  {label: 'option4', value: 'value4', icon: 'bomb', disabled: true},
  {
    label: 'option8',
    value: 'value8',
    children: [
      {
        label: 'option9',
        value: 'value9',
        icon: 'bolt',
        children: [{label: 'option10', value: 'value10'}],
      },
    ],
  },
];
suite('HyDropdownComponent', () => {
  test('should show dropdown on click when trigger is click', async () => {
    const el: HyDropdownComponent = await fixture(
      html`<hy-dropdown .trigger=${TriggerMode.Click} .options=${options}></hy-dropdown>`
    );
    const slot = el.shadowRoot!.querySelector('slot')!;
    slot.click();
    expect(el.show).to.be.true;
    slot.click();
    expect(el.show).to.be.false;
  });

  test('should show dropdown on hover when trigger is hover', async () => {
    const el: HyDropdownComponent = await fixture(
      html`<hy-dropdown .trigger=${TriggerMode.Hover} .options=${options}></hy-dropdown>`
    );
    const slot = el.shadowRoot!.querySelector('slot')!;
    expect(el.show).to.be.false;
    slot.dispatchEvent(new Event('mouseenter'));
    expect(el.show).to.be.true;
  });

  test('should hide dropdown on click outside when trigger is click', async () => {
    const el: HyDropdownComponent = await fixture(
      html`<hy-dropdown .show=${true} .trigger=${TriggerMode.Click} .options=${options}></hy-dropdown>`
    );
    expect(el.show).to.be.true;
    window.dispatchEvent(new Event('click'));
    expect(el.show).to.be.false;
  });
  test('should hide dropdown on mouseleave dropdown', async () => {
    const el: HyDropdownComponent = await fixture(html`<hy-dropdown .show=${true} .options=${options}></hy-dropdown>`);
    const dropDownContainer = el.shadowRoot!.querySelector('.dropdown-container') as HTMLElement;
    expect(el.show).to.be.true;
    dropDownContainer.dispatchEvent(new Event('mouseleave'));
    expect(el.show).to.be.false;
  });

  test('should hide dropdown on option click event', async () => {
    const el: HyDropdownComponent = await fixture(html`
      <hy-dropdown .show=${true} .options=${options}></hy-dropdown>
    `);
    const dropDownContainer: HTMLElement = el.shadowRoot!.querySelector('.dropdown-container')!;
    expect(el.show).to.be.true;
    dropDownContainer.dispatchEvent(new Event('click-item'));
    expect(el.show).to.be.false;
  });

  suite('hy-dropdown-item', () => {
    test('dropdown item with icon and label', async () => {
      const iconName = 'bomb';
      const labelText = 'label';
      const el: HyDropdownItem = await fixture(
        html`<hy-dropdown-item icon="${iconName}" label="${labelText}"></hy-dropdown-item>`
      );
      const icon = el.shadowRoot!.querySelector('hy-icon');
      const label = el.shadowRoot!.querySelector('.option-label');
      expect(icon).to.exist;
      expect(icon!.getAttribute('name')).to.equal(iconName);
      expect(label).to.exist;
      expect(label!.textContent).to.equal(labelText);
    });

    test('should dispatch click-item ', async () => {
      const el: HyDropdownItem = await fixture(
        html`<hy-dropdown-item label="Test Label" value="test-value"></hy-dropdown-item>`
      );
      let clickItemDispatched = false;
      el.addEventListener('click-item', () => {
        clickItemDispatched = true;
      });
      el.shadowRoot!.querySelector('div')!.click();
      expect(clickItemDispatched).to.be.true;
    });
    test('should not dispatch click-item event when disabled', async () => {
      const el: HyDropdownItem = await fixture(
        html`<hy-dropdown-item label="Test Label" value="test-value" disabled></hy-dropdown-item>`
      );
      let clickItemDispatched = false;
      el.addEventListener('click-item', () => {
        clickItemDispatched = true;
      });
      el.shadowRoot!.querySelector('div')!.click();
      expect(clickItemDispatched).to.be.false;
    });
  });
  suite('hy-dropdown-menu', () => {
    test('should show menu children on mouse enter and hide on mouse leave', async () => {
      const el: HyDropdownMenu = await fixture(
        html`<hy-dropdown-menu label="Test Label"><div>Child Item</div></hy-dropdown-menu>`
      );
      const div = el.shadowRoot!.querySelector('div')!;
      expect(el.showChildren).to.be.false;
      expect(el.shadowRoot!.querySelector('slot')).to.have.style('display', 'none');
      div.dispatchEvent(new Event('mouseenter'));
      await el.updateComplete;
      expect(el.showChildren).to.be.true;
      expect(el.shadowRoot!.querySelector('slot')).to.have.style('display', 'block');
      div.dispatchEvent(new Event('mouseleave'));
      expect(el.showChildren).to.be.false;
    });

    test('should not show children if disabled', async () => {
      const el: HyDropdownMenu = await fixture(html`<hy-dropdown-menu label="Test Label" disabled></hy-dropdown-menu>`);
      const div = el.shadowRoot!.querySelector('div')!;
      expect(el.shadowRoot!.querySelector('slot')).to.have.style('display', 'none');
      div.dispatchEvent(new Event('mouseenter'));
      expect(el.showChildren).to.be.false;
      expect(el.shadowRoot!.querySelector('slot')).to.not.have.style('display', 'block');
    });

    test('should stop event propagation on click', async () => {
      const el: HyDropdownMenu = await fixture(html`<hy-dropdown-menu label="Test Label"></hy-dropdown-menu>`);
      const div = el.shadowRoot!.querySelector('div')!;
      let eventStopped = true;
      window.addEventListener('click', () => {
        eventStopped = false;
      });
      div.click();
      expect(eventStopped).to.be.true;
    });
  });
});
