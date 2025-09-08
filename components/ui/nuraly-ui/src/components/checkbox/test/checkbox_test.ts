import { html, fixture, expect } from '@open-wc/testing';
import '../checkbox.component';
import { NrCheckboxElement } from '../checkbox.component';

suite('nr-checkbox', () => {
  test('init checkbox', async () => {
    const el: NrCheckboxElement = await fixture(html`<nr-checkbox></nr-checkbox>`)!;
    const input = el.shadowRoot!.querySelector('input[type="checkbox"]')!;
    const inputContent = window.getComputedStyle(input, '::after').getPropertyValue('content');
    expect(el.disabled).to.be.false;
    expect(el.indeterminate).to.be.false;
    expect(el.disabled).to.be.false;
    expect(input).to.exist;
    expect(inputContent).to.equal('""');
  });

  test('should reflect the checked attribute', async () => {
    const el: NrCheckboxElement = await fixture(html`<nr-checkbox checked></nr-checkbox>`);
    const input: HTMLInputElement = el.shadowRoot!.querySelector('input')!;
    const inputContent = window.getComputedStyle(input, '::after').getPropertyValue('content');
    expect(el.checked).to.be.true;
    expect(input.checked).to.be.true;
    expect(inputContent).to.not.be.empty;
    expect(inputContent).to.contain('✔');
    expect(inputContent).to.not.contain('-');
  });

  test('should reflect the disabled attribute', async () => {
    const el: NrCheckboxElement = await fixture(html`<nr-checkbox disabled></nr-checkbox>`)!;
    const input: HTMLInputElement = el.shadowRoot!.querySelector('input')!;
    expect(el.disabled).to.be.true;
    expect(input.disabled).to.be.true;
  });

  test('should reflect indeterminate attribubute', async () => {
    const el: NrCheckboxElement = await fixture(html`<nr-checkbox indeterminate></nr-checkbox>`);
    const input: HTMLInputElement = el.shadowRoot!.querySelector('input')!;
    const inputContent = window.getComputedStyle(input, '::after').getPropertyValue('content');

    expect(el.indeterminate).to.be.true;
    expect(inputContent).to.not.be.empty;
    expect(inputContent).to.contain('-');
    expect(inputContent).to.not.contain('✔');
  });

  test('should toggle checked state on change', async () => {
    const el: NrCheckboxElement = await fixture(html`<nr-checkbox></nr-checkbox>`);
    let input: HTMLInputElement = el.shadowRoot!.querySelector('input')!;
    let inputContent = window.getComputedStyle(input, '::after').getPropertyValue('content');

    expect(el.checked).to.be.false;
    expect(inputContent).to.equal('""');

    input.click();
    await el.updateComplete;
    input = el.shadowRoot!.querySelector('input')!;
    inputContent = window.getComputedStyle(input, '::after').getPropertyValue('content');

    expect(el.checked).to.be.true;
    expect(inputContent).to.contain('✔');

    input.click();
    await el.updateComplete;
    input = el.shadowRoot!.querySelector('input')!;
    inputContent = window.getComputedStyle(input, '::after').getPropertyValue('content');
    expect(el.checked).to.be.false;
    expect(inputContent).to.equal('""');
  });

  test('should dispatch "nr-change" event on change', async () => {
    const el: NrCheckboxElement = await fixture(html`<nr-checkbox></nr-checkbox>`)!;
    const input: HTMLInputElement = el.shadowRoot!.querySelector('input')!;
    let checkboxChangedDispatched = false;

    el.addEventListener('nr-change', () => {
      checkboxChangedDispatched = true;
    });

    input.click();

    expect(checkboxChangedDispatched).to.be.true;
  });

  test('should not dispatch "nr-change" event on change when checkbox is disabled', async () => {
    const el: NrCheckboxElement = await fixture(html`<nr-checkbox disabled></nr-checkbox>`)!;
    const input: HTMLInputElement = el.shadowRoot!.querySelector('input')!;
    let checkboxChangedDispatched = false;

    el.addEventListener('nr-change', () => {
      checkboxChangedDispatched = true;
    });

    input.click();

    expect(checkboxChangedDispatched).to.be.false;
  });
});
