/**
 * Slider Input Types
 * Type definitions for the slider input component
 */

export interface SliderInputChangeEvent extends CustomEvent {
  detail: {
    value: number;
    min: number;
    max: number;
  };
}

export interface SliderInputOptions {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  disabled?: boolean;
}

export type SliderInputSize = 'small' | 'medium' | 'large';

export type SliderInputVariant = 'default' | 'primary' | 'success' | 'warning' | 'error';