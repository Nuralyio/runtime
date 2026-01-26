/**
 * @fileoverview Video Component Properties (TypeScript)
 * @module Studio/Params/Media/Video/Properties
 *
 * @description
 * TypeScript-based property definitions for the Video component.
 * Migrated from config.json to fully typed definitions.
 */

import {
  select,
  inputText,
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

const preloadOptions = [
  { value: 'none', label: 'None' },
  { value: 'metadata', label: 'Metadata' },
  { value: 'auto', label: 'Auto' },
];

// === Property Definitions ===

const srcProperty = inputText('src', 'src', 'Source URL')
  .placeholder('Video URL')
  .build();

const posterProperty = inputText('poster', 'poster', 'Poster Image')
  .placeholder('Poster image URL')
  .build();

const preloadProperty = select('preload')
  .label('Preload')
  .inputProperty('preload')
  .width('180px')
  .default('metadata')
  .placeholder('Select preload mode')
  .options(preloadOptions)
  .valueHandler(new ComponentInputHandler('preload', 'metadata'))
  .stateHandler(new InputStateHandler('preload'))
  .onChange(new UpdateInputHandler('preload', 'value'))
  .withInputHandler('preload')
  .build();

const autoplayProperty = inputBoolean('autoplay', 'autoplay', 'Autoplay').build();

const controlsProperty = inputBoolean('controls', 'controls', 'Show Controls')
  .default(true)
  .build();

const loopProperty = inputBoolean('loop', 'loop', 'Loop').build();
const mutedProperty = inputBoolean('muted', 'muted', 'Muted').build();

// === Export ===

export const videoProperties: PropertyDefinition[] = [
  srcProperty,
  posterProperty,
  preloadProperty,
  autoplayProperty,
  controlsProperty,
  loopProperty,
  mutedProperty,
];

export const videoDefinition: ComponentDefinition = {
  type: 'video',
  name: 'Video',
  category: 'media',
  panel: {
    containerUuid: 'video_collapse_container',
    containerName: 'Video Fields Container',
    collapseUuid: 'video_collapse',
    collapseTitle: 'Video Properties',
  },
  properties: videoProperties,
  events: ['play', 'pause', 'ended', 'error'],
  includeCommonProperties: [
    'component_value_text_block',
    'component_id_text_block',
    'display_block',
    'access_block',
    'component_hash_text_block',
  ],
};

export default videoDefinition;
