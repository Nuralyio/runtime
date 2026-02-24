import { fixture, expect, html } from '@open-wc/testing';
import '../radio-group.component';
import { NrRadioGroupElement } from '../radio-group.component';

suite('NrRadioGroupElement', () => {
  test('should render options correctly', async () => {
    const options = [
      {label: 'Option 1', value: '1'},
      {label: 'Option 2', value: '2'},
    ];
    const value = options[0].value;
    const el = await fixture(
      html`<nr-radio-group .options=${options} .value=${value}></nr-radio-group>`
    )! as NrRadioGroupElement;

    const radioOptions = el.shadowRoot!.querySelectorAll('.radio');
    expect(radioOptions.length).to.equal(options.length);

    const selectedRadio = el.shadowRoot!.querySelector('input[type="radio"]:checked')! as HTMLInputElement;
    expect(selectedRadio.value).to.equal(value);
  });

  test('should handle option change', async () => {
    const options = [
      {label: 'Option 1', value: '1'},
      {label: 'Option 2', value: '2'},
    ];
    const value = options[0].value;
    const el = await fixture(
      html`<nr-radio-group .options=${options} .value=${value}></nr-radio-group>`
    )! as NrRadioGroupElement;
    expect(el.selectedOption).to.equal(value);
    const radioInputs = el.shadowRoot!.querySelectorAll('input[type="radio"]') as NodeListOf<HTMLInputElement>;
    radioInputs[1].click();
    expect(el.selectedOption).to.equal('2');
  });

  test('should disable all options if one default option is disabled', async () => {
    const options = [
      {label: 'Option 1', value: '1', disabled: true},
      {label: 'Option 2', value: '2'},
    ];
    const value = options[0].value;
    const el = await fixture(
      html`<nr-radio-group .options=${options} .value=${value}></nr-radio-group>`
    )! as NrRadioGroupElement;
    const radioInputs = el.shadowRoot!.querySelectorAll('input[type="radio"]') as NodeListOf<HTMLInputElement>;
    radioInputs.forEach((input) => {
      expect(input.disabled).to.be.true;
    });
  });

  test('should dispatch a change event when option is changed', async () => {
    const options = [
      {label: 'Option 1', value: '1'},
      {label: 'Option 2', value: '2'},
    ];
    const el = await fixture(html`<nr-radio-group .options=${options}></nr-radio-group>`)! as NrRadioGroupElement;
    const radioInput = el.shadowRoot!.querySelector('input[type="radio"]') as HTMLInputElement;
    let changeEventTriggered = false;
    el.addEventListener('change', () => {
      changeEventTriggered = true;
    });

    radioInput.click();
    expect(changeEventTriggered).to.be.true;
  });

  test('should not dispatch a change event when the same option is clicked', async () => {
    const options = [
      {label: 'Option 1', value: '1'},
      {label: 'Option 2', value: '2'},
    ];
    const defaultOption = options[0].value;
    const el = await fixture(
      html`<nr-radio-group .options=${options} .value=${defaultOption}></nr-radio-group>`
    )! as NrRadioGroupElement;
    const radioInput = el.shadowRoot!.querySelectorAll('input[type="radio"]')[0] as HTMLInputElement;
    let changeEventTriggered = false;
    el.addEventListener('change', () => {
      changeEventTriggered = true;
    });

    radioInput.click();
    expect(changeEventTriggered).to.be.false;
  });
});
