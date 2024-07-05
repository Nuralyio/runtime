/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import '../radio.component';
import {RadioButtonOption} from '../radio.type';
@customElement('hy-radios-demo')
export class RadioComponentDemo extends LitElement {
  options: RadioButtonOption[] = [
    {
      label: 'Option 1',
      value: 'option1',
    },
    {
      label: 'Option 2',
      value: 'option2',
      disabled: true,
    },
    {
      label: 'Optionnnnn 3',
      value: 'option3',
    },
    {
      label: 'Option 4',
      value: 'option4',
    },
  ];
  defaultValue = 'option2';
  defaultValueForDisabledOption = 'option3';

  optionsExample2: RadioButtonOption[] = [
    {
      label: 'Option 1',
      value: 'option1',
    },
    {
      label: 'Option 2',
      value: 'option2',
    },
    {
      label: 'Optionnnnnnnn 3',
      value: 'option3',
    },
    {
      label: 'Option 4',
      value: 'option 4',
    },
  ];

  optionsWithIcons: RadioButtonOption[] = [
    {
      label: 'Option 1',
      value: 'option1',
      icon: 'bomb',
    },
    {
      label: 'Option 2',
      value: 'option2',
      icon: 'bug',
    },
    {
      label: 'Optionnnnn 3',
      value: 'option3',
      icon: 'user',
    },
  ];
  optionsWithIconsAndDisabled: RadioButtonOption[] = [
    {
      label: 'Option 1',
      value: 'option1',
      icon: 'bomb',
    },
    {
      label: 'Option 2',
      value: 'option2',
      icon: 'bug',
      disabled: true,
    },
    {
      label: 'Optionnnnn 3',
      value: 'option3',
      icon: 'user',
    },
  ];
  optionsWithIconsOnlyAndDisabled: RadioButtonOption[] = [
    {
      label: '',
      value: 'option1',
      icon: 'bomb',
    },
    {
      label: '',
      value: 'option2',
      disabled: true,
      icon: 'bug',
    },
    {
      label: '',
      value: 'option3',
      icon: 'user',
    },
  ];
  optionsWithIconsOnly: RadioButtonOption[] = [
    {
      label: '',
      value: 'option1',
      icon: 'bomb',
    },
    {
      label: '',
      value: 'option2',
      icon: 'bug',
    },
    {
      label: '',
      value: 'option3',
      icon: 'user',
    },
  ];
  optionsWithState: RadioButtonOption[] = [
    {
      label: 'Option 1',
      value: 'option1',
      state: 'error',
      message: 'Error message',
    },
    {
      label: 'Option 2',
      value: 'Option 2',
      state: 'warning',
      message: 'warning message',
    },
    {
      label: 'Option 3',
      value: 'option3',
      icon: 'user',
    },
  ];
  optionsWithStateAndDisabled: RadioButtonOption[] = [
    {
      label: 'Option 1',
      value: 'option1',
      state: 'error',
      message: 'Error message',
      disabled: true,
    },
    {
      label: 'Option 2',
      value: 'Option 2',
      state: 'warning',
      message: 'warning message',
      disabled: true,
    },
    {
      label: 'Option 3',
      value: 'option3',
      icon: 'user',
    },
  ];
  override render() {
    return html`
      <h1>Style: Radio (default)</h1>
      <h3>Default</h3>
      <hy-radio-input
        .options=${this.optionsExample2}
        @change=${(e: CustomEvent) => console.log('you selected ', e.detail.value)}
      ></hy-radio-input>
      <br />
      <h3>Default with initial selected value: ${this.defaultValue}</h3>
      <hy-radio-input
        .options=${this.optionsExample2}
        .defaultValue=${this.defaultValue}
        @change=${(e: CustomEvent) => console.log('you selected ', e.detail.value)}
      ></hy-radio-input>
      <br />
      <h3>Default with error/warning messages</h3>
      <hy-radio-input
        .options=${this.optionsWithState}
        @change=${(e: CustomEvent) => console.log('you selected ', e.detail.value)}
      ></hy-radio-input>
      <br />
      <h3>With disabled option</h3>
      <hy-radio-input
        .options=${this.options}
        @change=${(e: CustomEvent) => console.log('you selected ', e.detail.value)}
      ></hy-radio-input>
      <br />
      <h3>Default with error/warning messages and disabled options</h3>
      <hy-radio-input
        .options=${this.optionsWithStateAndDisabled}
        @change=${(e: CustomEvent) => console.log('you selected ', e.detail.value)}
      ></hy-radio-input>
      <br />
      <h3>With disabled option and default selected (${this.defaultValueForDisabledOption})</h3>
      <hy-radio-input
        .options=${this.options}
        .defaultValue=${this.defaultValueForDisabledOption}
        @change=${(e: CustomEvent) => console.log('you selected ', e.detail.value)}
      ></hy-radio-input>
      <br />
      <h3>With default selected value (${this.defaultValue}) disabled</h3>
      <hy-radio-input
        .options=${this.options}
        .defaultValue=${this.defaultValue}
        @change=${(e: CustomEvent) => console.log('you selected ', e.detail.value)}
      ></hy-radio-input>
      <br />
      <h3>Position right default</h3>
      <hy-radio-input .options=${this.optionsExample2} .position=${'right'}></hy-radio-input>
      <br />
      <h3>Position right default with error/warning</h3>
      <hy-radio-input .options=${this.optionsWithState} .position=${'right'}></hy-radio-input>
      <br />
      <h3>Horizontal direction</h3>
      <hy-radio-input .direction=${'horizontal'} .options=${this.options}></hy-radio-input>
      <br />
      <h3>Horizontal direction with error/warning</h3>
      <hy-radio-input .direction=${'horizontal'} .options=${this.optionsWithState}></hy-radio-input>
      <br />
      <h3>Position right horizontal</h3>
      <hy-radio-input .options=${this.options} .direction=${'horizontal'} .position=${'right'}></hy-radio-input>
      <br />
      <h3>Position right horizontal with error/warning</h3>
      <hy-radio-input
        .options=${this.optionsWithState}
        .direction=${'horizontal'}
        .position=${'right'}
      ></hy-radio-input>
      <br />

      <h1>Style: Button</h1>
      <h3>Default</h3>
      <hy-radio-input
        .options=${this.optionsExample2}
        .type=${'button'}
        @change=${(e: CustomEvent) => console.log('you selected ', e.detail.value)}
      ></hy-radio-input>
      <br />
      <h3>Default with inital selected</h3>
      <hy-radio-input
        .options=${this.optionsExample2}
        .type=${'button'}
        .defaultValue=${this.defaultValue}
        @change=${(e: CustomEvent) => console.log('you selected ', e.detail.value)}
      ></hy-radio-input>
      <br />
      <h3>With disabled option</h3>
      <hy-radio-input
        .options=${this.options}
        .type=${'button'}
        @change=${(e: CustomEvent) => console.log('you selected ', e.detail.value)}
      ></hy-radio-input>

      <h3>Selected option is disabled</h3>
      <hy-radio-input .options=${this.options} .defaultValue=${this.defaultValue} .type=${'button'}></hy-radio-input>
      <br />

      <h3>with icons default</h3>
      <hy-radio-input .options=${this.optionsWithIcons} .type=${'button'}></hy-radio-input>
      <br />
      <h3>with icons and inital selected (${this.defaultValue})</h3>
      <hy-radio-input
        .options=${this.optionsWithIcons}
        .type=${'button'}
        .defaultValue=${this.defaultValue}
      ></hy-radio-input>
      <br />
      <h3>with icons and disabled option</h3>
      <hy-radio-input .options=${this.optionsWithIconsAndDisabled} .type=${'button'}></hy-radio-input>
      <br />
      <h3>with icons and disabled option selected</h3>
      <hy-radio-input
        .options=${this.optionsWithIconsAndDisabled}
        .type=${'button'}
        .defaultValue=${this.defaultValue}
      ></hy-radio-input>
      <br />
      <h3>with icons only</h3>
      <hy-radio-input .options=${this.optionsWithIconsOnly} .type=${'button'}></hy-radio-input>
      <br />
      <h3>with icons only and disabled option</h3>
      <hy-radio-input .options=${this.optionsWithIconsOnlyAndDisabled} .type=${'button'}></hy-radio-input>
      <br />
      <h3>with icons only and default selected value (${this.defaultValue})</h3>
      <hy-radio-input
        .options=${this.optionsWithIconsOnly}
        .type=${'button'}
        .defaultValue=${this.defaultValue}
      ></hy-radio-input>
      <br />
      <h3>with icons only and disabled option selected (${this.defaultValue})</h3>
      <hy-radio-input
        .options=${this.optionsWithIconsOnlyAndDisabled}
        .type=${'button'}
        .defaultValue=${this.defaultValue}
      ></hy-radio-input>
      <br />
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'hy-radios-demo': RadioComponentDemo;
  }
}
