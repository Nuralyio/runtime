/**
 * @fileoverview Code Component Properties (TypeScript)
 * @module Studio/Params/Content/Code/Properties
 *
 * @description
 * TypeScript-based property definitions for the Code component.
 * Migrated from config.json to fully typed definitions.
 */

import {
  textarea,
  select,
  inputBoolean,
  type PropertyDefinition,
  type ComponentDefinition,
} from '../../../core/properties';
import {
  ComponentInputHandler,
} from '../../../core/handlers';
import {
  InputStateHandler,
} from '../../../core/handlers/state-handlers';
import {
  UpdateInputHandler,
} from '../../../core/handlers/event-handlers';

// === Custom Options ===

const languageOptions = [
  { value: 'javascript', label: 'JavaScript/TypeScript' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'plaintext', label: 'Plain Text' },
];

const themeOptions = [
  { value: 'vs', label: 'Light (VS)' },
  { value: 'vs-dark', label: 'Dark (VS Dark)' },
];

// === Property Definitions ===

const valueProperty = textarea('code_value')
  .label('Code Content')
  .inputProperty('value')
  .width('180px')
  .placeholder('Enter code...')
  .valueHandler(new ComponentInputHandler('value', ''))
  .stateHandler(new InputStateHandler('value'))
  .onChange(new UpdateInputHandler('value', 'string'))
  .withInputHandler('value')
  .build();

const languageProperty = select('language')
  .label('Language')
  .inputProperty('language')
  .width('180px')
  .default('javascript')
  .placeholder('Select language')
  .options(languageOptions)
  .valueHandler(new ComponentInputHandler('language', 'javascript'))
  .stateHandler(new InputStateHandler('language'))
  .onChange(new UpdateInputHandler('language', 'value'))
  .withInputHandler('language')
  .build();

const themeProperty = select('theme')
  .label('Theme')
  .inputProperty('theme')
  .width('180px')
  .default('vs-dark')
  .placeholder('Select theme')
  .options(themeOptions)
  .valueHandler(new ComponentInputHandler('theme', 'vs-dark'))
  .stateHandler(new InputStateHandler('theme'))
  .onChange(new UpdateInputHandler('theme', 'value'))
  .withInputHandler('theme')
  .build();

const readonlyProperty = inputBoolean('code_readonly', 'readonly', 'Read Only').build();

// === Export ===

export const codeProperties: PropertyDefinition[] = [
  valueProperty,
  languageProperty,
  themeProperty,
  readonlyProperty,
];

export const codeDefinition: ComponentDefinition = {
  type: 'code',
  name: 'Code',
  category: 'content',
  panel: {
    containerUuid: 'code_collapse_container',
    containerName: 'Code Fields Container',
    collapseUuid: 'code_collapse',
    collapseTitle: 'Code Properties',
  },
  properties: codeProperties,
  events: ['change', 'click', 'keydown', 'keyup'],
  includeCommonProperties: [
    'component_value_text_block',
    'component_id_text_block',
    'display_block',
    'access_block',
    'component_hash_text_block',
  ],
};

export default codeDefinition;
