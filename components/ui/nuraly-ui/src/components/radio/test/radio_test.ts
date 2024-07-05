import {fixture, expect, html} from '@open-wc/testing';
import '../radio.component';
import {HyRadioComponent} from '../radio.component';

suite('HyRadioComponent', () => {
  test('should render options correctly', async () => {
    const options = [
      {label: 'Option 1', value: '1'},
      {label: 'Option 2', value: '2'},
    ];
    const defaultValue = options[0].value;
    const el = await fixture(
      html`<hy-radio-input .options=${options} .defaultValue=${defaultValue}></hy-radio-input>`
    )!;

    const radioOptions = el.shadowRoot!.querySelectorAll('.radio');
    expect(radioOptions.length).to.equal(options.length);

    const selectedRadio = el.shadowRoot!.querySelector('input[type="radio"]:checked')! as HTMLInputElement;
    expect(selectedRadio.value).to.equal(defaultValue);
  });

  test('should handle option change', async () => {
    const options = [
      {label: 'Option 1', value: '1'},
      {label: 'Option 2', value: '2'},
    ];
    const defaultValue = options[0].value;
    const el: HyRadioComponent = await fixture(
      html`<hy-radio-input .options=${options} .defaultValue=${defaultValue}></hy-radio-input>`
    )!;
    expect(el.selectedOption).to.equal(defaultValue);
    const radioInputs = el.shadowRoot!.querySelectorAll('input[type="radio"]') as NodeListOf<HTMLInputElement>;
    radioInputs[1].click();
    expect(el.selectedOption).to.equal('2');
  });

  test('should disable all options if one default option is disabled', async () => {
    const options = [
      {label: 'Option 1', value: '1', disabled: true},
      {label: 'Option 2', value: '2'},
    ];
    const defaultValue = options[0].value;
    const el: HyRadioComponent = await fixture(
      html`<hy-radio-input .options=${options} .defaultValue=${defaultValue}></hy-radio-input>`
    )!;
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
    const el: HyRadioComponent = await fixture(html`<hy-radio-input .options=${options}></hy-radio-input>`)!;
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
    const defaultOptoin = options[0].value;
    const el: HyRadioComponent = await fixture(
      html`<hy-radio-input .options=${options} .defaultValue=${defaultOptoin}></hy-radio-input>`
    )!;
    const radioInput = el.shadowRoot!.querySelectorAll('input[type="radio"]')[0] as HTMLInputElement;
    let changeEventTriggered = false;
    el.addEventListener('change', () => {
      changeEventTriggered = true;
    });

    radioInput.click();
    expect(changeEventTriggered).to.be.false;
  });
});
