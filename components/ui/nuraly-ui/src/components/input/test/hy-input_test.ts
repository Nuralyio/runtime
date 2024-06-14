import {html, fixture, expect} from '@open-wc/testing';
import {HyInputElement} from '../input.component';
import {INPUT_STATE, INPUT_SIZE, INPUT_TYPE, EMPTY_STRING} from '../input.constant';
import '../input.component';
import {HyIconElement} from '../../icon';
suite('HyInputElement', () => {
  test('default properties', async () => {
    const el: HyInputElement = await fixture(html`<hy-input> </hy-input>`);
    const inputContainer = el.shadowRoot!.querySelector('#input-container')!;
    const input = el.shadowRoot!.querySelector('input')!;
    const slot = el.shadowRoot!.querySelector('slot');
    const assignedNode = slot!.assignedNodes();
    expect(el.disabled).to.be.false;
    expect(el.state).to.equal(INPUT_STATE.Default);
    expect(el.value).to.equal(EMPTY_STRING);
    expect(el.size).to.equal(INPUT_SIZE.Medium);
    expect(el.type).to.equal(INPUT_TYPE.TEXT);
    expect(el.placeholder).to.equal(EMPTY_STRING);
    expect(el.min).to.be.undefined;
    expect(el.max).to.be.undefined;
    expect(el.step).to.be.undefined;

    expect(input).to.not.have.attribute('min');
    expect(input).to.not.have.attribute('max');
    expect(input).to.not.have.attribute('step');
    expect(input.disabled).to.be.false;
    expect(input.type).to.equal(INPUT_TYPE.TEXT);
    expect(input.value).to.equal(EMPTY_STRING);
    expect(input.placeholder).to.equal(EMPTY_STRING);
    expect(inputContainer).to.have.attribute('data-size', INPUT_SIZE.Medium);
    expect(inputContainer.querySelector('#warning-icon')).to.be.null;
    expect(inputContainer.querySelector('#error-icon')).to.be.null;
    expect(inputContainer.querySelector('#password-icon')).to.be.null;
    expect(inputContainer.querySelector('#number-icons')).to.be.null;
    expect(assignedNode.length).to.equal(0);
  });

  test('input type password', async () => {
    const el: HyInputElement = await fixture(html`<hy-input type="password"> </hy-input>`);
    const inputContainer = el.shadowRoot!.querySelector('#input-container')!;
    let passwordIcon: HyIconElement = inputContainer.querySelector('#password-icon')!;
    expect(inputContainer.querySelector('#number-icons')).to.be.null;
    expect(passwordIcon).to.exist;
    expect(passwordIcon).to.have.attribute('name', 'eye');
    passwordIcon.click();
    await el.updateComplete;
    expect(el.inputType).to.equal('text');
    passwordIcon = inputContainer.querySelector('#password-icon')!;
    expect(passwordIcon).to.have.attribute('name', 'eye-slash');
  });

  suite('input type number', () => {
    test('init number input ', async () => {
      const step = 5;
      const min = 10;
      const max = 100;
      const el: HyInputElement = await fixture(
        html`<hy-input type="number" step=${step} min=${min} max=${max}> </hy-input>`
      );
      const inputContainer = el.shadowRoot!.querySelector('#input-container')!;
      const input = el.shadowRoot!.querySelector('input')!;
      const passwordIcon: HyIconElement = inputContainer.querySelector('#password-icon')!;
      const numberIcon = inputContainer.querySelector('#number-icons');
      expect(passwordIcon).to.be.null;
      expect(numberIcon).to.exist;
      expect(input).to.have.attribute('min', min.toString());
      expect(input).to.have.attribute('max', max.toString());
      expect(input).to.have.attribute('step', step.toString());
    });
    test('increment number', async () => {
      const step = 5;
      const min = 10;
      const el: HyInputElement = await fixture(html`<hy-input type="number" step=${step} min=${min}> </hy-input>`);
      const inputContainer = el.shadowRoot!.querySelector('#input-container')!;
      const input = el.shadowRoot!.querySelector('input')!;
      const numberIcon = inputContainer.querySelector('#number-icons');
      const plusButton: HyIconElement = numberIcon!.querySelector("[name='plus']")!;
      plusButton.click();
      expect(input.value).to.equal((min + step).toString());
    });
    test('decrement number', async () => {
      const step = 5;
      const el: HyInputElement = await fixture(html`<hy-input type="number" step=${step}> </hy-input>`);
      const inputContainer = el.shadowRoot!.querySelector('#input-container')!;
      const input = el.shadowRoot!.querySelector('input')!;
      const inputValue = input.value;
      const numberIcon = inputContainer.querySelector('#number-icons');
      const minusButton: HyIconElement = numberIcon!.querySelector("[name='minus']")!;
      minusButton.click();
      expect(input.value).to.equal((+inputValue - step).toString());
    });
  });

  suite('input with state', () => {
    test('warning input', async () => {
      const inputState = INPUT_STATE.Warning;
      const el: HyInputElement = await fixture(html`<hy-input state=${inputState}> </hy-input>`);
      const inputContainer = el.shadowRoot!.querySelector('#input-container')!;
      expect(inputContainer.querySelector('#warning-icon')).to.exist;
      expect(inputContainer.querySelector('#error-icon')).to.not.exist;
    });
    test('error input', async () => {
      const inputState = INPUT_STATE.Error;
      const el: HyInputElement = await fixture(html`<hy-input state=${inputState}> </hy-input>`);
      const inputContainer = el.shadowRoot!.querySelector('#input-container')!;
      expect(inputContainer.querySelector('#warning-icon')).to.not.exist;
      expect(inputContainer.querySelector('#error-icon')).to.exist;
    });
  });
  suite('input with size', () => {
    test('large input', async () => {
      const inputSize = INPUT_SIZE.Large;
      const el: HyInputElement = await fixture(html`<hy-input size=${inputSize}> </hy-input>`);
      const inputContainer = el.shadowRoot!.querySelector('#input-container')!;
      expect(inputContainer).to.have.attribute('data-size', inputSize);
    });
    test('medium input', async () => {
      const inputSize = INPUT_SIZE.Medium;
      const el: HyInputElement = await fixture(html`<hy-input size=${inputSize}> </hy-input>`);
      const inputContainer = el.shadowRoot!.querySelector('#input-container')!;
      expect(inputContainer).to.have.attribute('data-size', inputSize);
    });
  });
  test('input with placeholder', async () => {
    const placeholder = 'text of placeholder';
    const el: HyInputElement = await fixture(html`<hy-input placeholder=${placeholder}> </hy-input>`);
    const input = el.shadowRoot!.querySelector('input')!;
    expect(input).to.have.attribute('placeholder', placeholder);
  });

  test('input with label', async () => {
    const inputLabel = 'input label';
    const el: HyInputElement = await fixture(html`<hy-input> <span slot="label">${inputLabel}</span> </hy-input>`);
    const slot = el.shadowRoot!.querySelector('slot');
    const assignedNode = slot!.assignedNodes();
    expect(assignedNode[0]).to.have.attribute('slot', 'label');
    expect(assignedNode[0].textContent).to.equal(inputLabel);
  });

  test('input with helper text', async () => {
    const inputHelper = 'input helper';
    const el: HyInputElement = await fixture(
      html`<hy-input> <span slot="helper-text">${inputHelper}</span> </hy-input>`
    );
    const slot = el.shadowRoot!.querySelectorAll('slot');
    const assignedNode = slot[1].assignedNodes();
    expect(assignedNode[0]).to.have.attribute('slot', 'helper-text');
    expect(assignedNode[0].textContent).to.equal(inputHelper);
  });

  test('input disabled', async () => {
    const el: HyInputElement = await fixture(html`<hy-input disabled></hy-input>`);
    const input = el.shadowRoot!.querySelector('input')!;
    expect(input.disabled).to.be.true;
    let inputFocus = false;
    input.addEventListener('focus', () => {
      inputFocus = true;
    });
    input.focus();

    expect(inputFocus).to.equal(false);
  });
});
