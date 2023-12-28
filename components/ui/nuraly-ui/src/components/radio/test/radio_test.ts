import { fixture, html, expect } from '@open-wc/testing';
import { RadioButtonType } from '../radio.type';
import './radio.component.ts'; 

suite('HySelectComponent', () => {
	
  test('renders default options as radio buttons', async () => {
    const el = await fixture(
      html`<hy-radio-input
        .options=${[
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' },
        ]}
      ></hy-radio-input>`
    );

    // Check if the radio buttons are rendered correctly
    const radioButtons = el.shadowRoot!.querySelectorAll('.radio-input');
    expect(radioButtons).to.have.lengthOf(2);
    expect(radioButtons[0]).to.have.property('value', 'option1');
    expect(radioButtons[1]).to.have.property('value', 'option2');
  });

  test('renders options with buttons when display is RadioButtonType.Button', async () => {
    // Create a fixture of your component with display set to RadioButtonType.Button
    const el = await fixture(
      html`<hy-radio-input
        .options=${[
          { value: 'option1', label: 'Option 1', button: { icon: 'icon1', type: 'primary' } },
          { value: 'option2', label: 'Option 2', button: { icon: 'icon2', type: 'secondary' } },
        ]}
        .display=${RadioButtonType.Button}
      ></hy-radio-input>`
    );

    // Check if options are rendered as buttons
    const buttons = el.shadowRoot!.querySelectorAll('hy-button');
    expect(buttons).to.have.lengthOf(2);
    expect(buttons[0]).to.have.property('type', 'primary');
    expect(buttons[1]).to.have.property('type', 'secondary');
  });

  test('dispatches a change event when an option is selected', async () => {
    const el = await fixture(
      html`<hy-radio-input
        .options=${[
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' },
        ]}
      ></hy-radio-input>`
    );

    let changeEventTriggered = false;

    // Add an event listener to the component to check if the change event is dispatched
    el.addEventListener('change', (event : Event) => {
      changeEventTriggered = true;
      expect((event as CustomEvent).detail.value).to.equal('option1'); // Check the selected value
    });

    // Simulate a click on the first radio button
    const radioButtons = el.shadowRoot!.querySelectorAll('.radio-input');
   ( radioButtons[0] as HTMLElement).click();

    // Check if the change event was triggered
    expect(changeEventTriggered).to.be.true;
  });
});
