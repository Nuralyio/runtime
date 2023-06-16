import {html, fixture, expect, oneEvent} from '@open-wc/testing';
import {HyMenuComponent} from '../menu.component';

suite('HyMenuComponent', () => {
  test.skip('should render the component with correct options', async () => {
    const options = [
      {
        label: 'Move up',
      },
      {label: 'Duplicate screen'},
      {label: 'Delete'},
      {label: 'Rename'},
    ];
    const component = await fixture<HyMenuComponent>(html`<hy-menu .options=${options}></hy-menu>`);
    await component.updateComplete;
    const renderedOptions = component.shadowRoot!.querySelectorAll('li');
    expect(renderedOptions).to.have.lengthOf(options.length);
  });

  test.skip('should select an option when clicked', async () => {
    const options = [
      {
        label: 'Move up',
      },
      {label: 'Duplicate screen'},
      {label: 'Delete'},
      {label: 'Rename'},
    ];
    const component = await fixture<HyMenuComponent>(html`<hy-menu .options=${options}></hy-menu>`);
    console.log(component);
    const optionToSelect = 'Option 2';
    const optionElement: HTMLElement | null = component.shadowRoot!.querySelector(`li:contains(${optionToSelect})`);

    setTimeout(() => optionElement!.click()); // Simulate a click event

    const {detail} = await oneEvent(component, 'change');
    expect(detail.value).to.equal(optionToSelect);
  });

  // Add more unit tests for other properties and methods of the component
});
