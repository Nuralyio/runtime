import {expect, fixture, html} from '@open-wc/testing';
import '../select.component.js';
import {HySelectComponent} from '../select.component.js';
import {SelectOption, SelectSize, SelectStatus, SelectType} from '../select.types.js';

const options: SelectOption[] = [
  {value: 'abuja', label: 'Abuja'},
  {value: 'duplin', label: 'Duplin'},
  {value: 'nairobi', label: 'Nairobi'},
  {value: 'beirut', label: 'Beirut'},
  {value: 'prague', label: 'Prague'},
];
suite('Hy-select', () => {
  test('init select', async () => {
    const el: HySelectComponent = await fixture(html`<hy-select .options=${options}></hy-select>`);
    expect(el.show).to.be.false;
    expect(el.placeholder).to.equal('Select an option');
    expect(el.disabled).to.be.false;
    expect(el.multiple).to.be.false;
    expect(el.type).to.equal(SelectType.Default);
    expect(el.status).to.equal(SelectStatus.Default);
    expect(el.size).to.equal(SelectSize.Medium);
    expect(el.selectedOptions).to.deep.equal([]);
    expect(el.defaultValue).to.deep.equal([]);
  });
  test('should hide/show options', async () => {
    const el: HySelectComponent = await fixture(html`<hy-select .options=${options}></hy-select>`);
    const wrapper: HTMLElement = el.shadowRoot!.querySelector('.wrapper')!;
    let displayedOptions: HTMLElement = el.shadowRoot!.querySelector('.options')!;
    let displayedStyle = window.getComputedStyle(displayedOptions).display;
    expect(el.show).to.equal(false);
    expect(displayedStyle).to.equal('none');
    wrapper.click();
    await el.updateComplete;
    displayedOptions = el.shadowRoot!.querySelector('.options')!;
    displayedStyle = window.getComputedStyle(displayedOptions).display;
    expect(el.show).to.be.true;
    expect(displayedStyle).to.equal('flex');
    expect(displayedOptions.children.length).to.equal(options.length);
  });
  test('should not toggle show when select disabled', async () => {
    const el: HySelectComponent = await fixture(html`<hy-select .options=${options} .disabled=${true}></hy-select>`);
    const wrapper: HTMLElement = el.shadowRoot!.querySelector('.wrapper')!;
    expect(el.show).to.equal(false);
    wrapper.click();
    await el.updateComplete;
    expect(el.show).to.be.false;
  });
  test('should dispatch change events', async () => {
    const el: HySelectComponent = await fixture(html`<hy-select .options=${options} .show=${true}></hy-select>`);
    const wrapper: HTMLElement = el.shadowRoot!.querySelector('.wrapper')!;
    let dispatchChangeEvent = false;
    el.addEventListener('changed', () => {
      dispatchChangeEvent = true;
    });
    const displayedOption: HTMLElement = wrapper.querySelector('.option')!;
    displayedOption.click();
    await el.updateComplete;
    expect(dispatchChangeEvent).to.be.true;
  });
  test('should select multiple options', async () => {
    const el: HySelectComponent = await fixture(html`<hy-select
      .options=${options}
      .show=${true}
      .multiple=${true}
    ></hy-select>`);
    const wrapper: HTMLElement = el.shadowRoot!.querySelector('.wrapper')!;
    const displayedOption: NodeListOf<HTMLElement> = wrapper.querySelectorAll('.option')!;
    expect(el.selectedOptions).to.deep.equal([]);
    displayedOption[0].click();
    await el.updateComplete;
    expect(el.selectedOptions).to.deep.equal([options[0]]);
    displayedOption[2].click();
    await el.updateComplete;
    expect(el.selectedOptions).to.deep.equal([options[0], options[2]]);
  });
  test('should select one option', async () => {
    const el: HySelectComponent = await fixture(html`<hy-select .options=${options} .show=${true}></hy-select>`);
    const wrapper: HTMLElement = el.shadowRoot!.querySelector('.wrapper')!;
    const displayedOption: NodeListOf<HTMLElement> = wrapper.querySelectorAll('.option')!;
    expect(el.selectedOptions).to.deep.equal([]);
    displayedOption[0].click();
    await el.updateComplete;
    expect(el.selectedOptions).to.deep.equal([options[0]]);
    displayedOption[2].click();
    await el.updateComplete;
    expect(el.selectedOptions).to.deep.equal([options[2]]);
  });
  suite('display default values', () => {
    test('should display default value when single default value provided in single selection mode', async () => {
      const defaultValues = ['abuja'];
      const el: HySelectComponent = await fixture(html`<hy-select
        .options=${options}
        .show=${true}
        .defaultValue=${defaultValues}
      ></hy-select>`);
      const option = options.find((option) => option.value == defaultValues[0]);
      expect(el.selectedOptions).to.deep.equal([option]);
    });
    test('should display first default option when multiple default values provided in single selection mode', async () => {
      const defaultValues = ['abuja', 'nairobi'];
      const el: HySelectComponent = await fixture(html`<hy-select
        .options=${options}
        .show=${true}
        .defaultValue=${defaultValues}
      ></hy-select>`);
      const option = options.find((option) => option.value == defaultValues[0]);

      expect(el.selectedOptions).to.deep.equal([option]);
    });
    test('should display default option values when multiple default values provided in multiple selection mode', async () => {
      const defaultValues = ['abuja', 'nairobi'];
      const el: HySelectComponent = await fixture(html`<hy-select
        .options=${options}
        .show=${true}
        .defaultValue=${defaultValues}
        .multiple=${true}
      ></hy-select>`);
      const selectedOptions: SelectOption[] = [];
      defaultValues.forEach((value) => {
        const option = options.find((option) => option.value == value)!;
        selectedOptions.push(option);
      });

      expect(el.selectedOptions).to.deep.equal(selectedOptions);
    });
  });
});
