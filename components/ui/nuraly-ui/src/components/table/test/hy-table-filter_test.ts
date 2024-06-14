import '../components/hy-table-filter';
import {HyTableFilter} from '../components/hy-table-filter';
import {fixture, html, expect} from '@open-wc/testing';
suite('HyTableFilterComponent', () => {
  test('init input filter', async () => {
    const el: HyTableFilter = await fixture(html`<hy-table-filter></hy-table-filter>`);
    const input: HTMLInputElement = el.shadowRoot!.querySelector('input')!;
    const iconContainer = el.shadowRoot?.querySelector('.icon-container');
    expect(el.showInput).to.be.false;
    expect(el.value).to.be.empty;
    expect(input).to.not.exist;
    expect(iconContainer).to.exist;
  });

  test('show input filter and hide icon on click icon', async () => {
    const el: HyTableFilter = await fixture(html`<hy-table-filter></hy-table-filter>`);
    let input: HTMLInputElement = el.shadowRoot!.querySelector('input')!;
    let iconContainer: HTMLElement = el.shadowRoot!.querySelector('.icon-container')!;
    expect(el.showInput).to.be.false;
    expect(input).to.not.exist;
    expect(iconContainer).to.exist;
    iconContainer.click();
    await el.updateComplete;
    input = el.shadowRoot!.querySelector('input')!;
    iconContainer = el.shadowRoot!.querySelector('.icon-container')!;
    expect(el.showInput).to.be.true;
    expect(input).to.exist;
    expect(iconContainer).to.not.exist;
  });
  test('dispatch value change', async () => {
    const el: HyTableFilter = await fixture(html`<hy-table-filter .showInput=${true}></hy-table-filter>`);
    const input: HTMLInputElement = el.shadowRoot!.querySelector('input')!;

    let valueChangeDispatched = false;
    el.addEventListener('value-change', () => {
      valueChangeDispatched = true;
    });
    input.dispatchEvent(new Event('input'));
    expect(valueChangeDispatched).to.be.true;
  });

  suite('on blur input', () => {
    test('show icon and hide input when input is empty', async () => {
      const el: HyTableFilter = await fixture(html`<hy-table-filter .showInput=${true}></hy-table-filter>`);
      const iconContainer: HTMLElement = el.shadowRoot!.querySelector('.icon-container')!;
      let input: HTMLInputElement = el.shadowRoot!.querySelector('input')!;
      expect(el.showInput).to.be.true;
      expect(input).to.exist;
      expect(iconContainer).to.not.exist;
      input.blur();
      await el.updateComplete;
      input = el.shadowRoot!.querySelector('input')!;
      expect(el.showInput).to.be.false;
      expect(input).to.not.exist;
    });
    test('expose input and hide icon when input is filled', async () => {
      const el: HyTableFilter = await fixture(html`<hy-table-filter .showInput=${true}></hy-table-filter>`);
      const iconContainer: HTMLElement = el.shadowRoot!.querySelector('.icon-container')!;
      let input: HTMLInputElement = el.shadowRoot!.querySelector('input')!;
      expect(input).to.exist;
      expect(iconContainer).to.not.exist;
      input.value = 'hey';
      input.dispatchEvent(new Event('input'));
      await el.updateComplete;
      input.blur();
      await el.updateComplete;
      input = el.shadowRoot!.querySelector('input')!;
      expect(el.showInput).to.be.true;
      expect(input).to.exist;
      expect(iconContainer).to.not.exist;
    });
  });
});
