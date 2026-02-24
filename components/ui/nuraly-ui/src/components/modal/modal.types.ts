/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

/**
 * Modal size options
 */
export enum ModalSize {
  Small = 'small',
  Medium = 'medium', 
  Large = 'large',
  ExtraLarge = 'xl'
}

/**
 * Modal position options
 */
export enum ModalPosition {
  Center = 'center',
  Top = 'top',
  Bottom = 'bottom'
}

/**
 * Modal animation types
 */
export enum ModalAnimation {
  Fade = 'fade',
  Zoom = 'zoom',
  SlideUp = 'slide-up',
  SlideDown = 'slide-down',
  None = 'none'
}

/**
 * Modal backdrop behavior
 */
export enum ModalBackdrop {
  Static = 'static', // clicking backdrop doesn't close modal
  Closable = 'closable', // clicking backdrop closes modal
  None = 'none' // no backdrop
}

/**
 * Modal events
 */
export interface ModalEvents {
  'modal-open': CustomEvent<void>;
  'modal-close': CustomEvent<void>;
  'modal-before-close': CustomEvent<{ cancel: () => void }>;
  'modal-after-open': CustomEvent<void>;
  'modal-escape': CustomEvent<void>;
}

/**
 * Modal configuration interface
 */
export interface ModalConfig {
  size?: ModalSize;
  position?: ModalPosition;
  animation?: ModalAnimation;
  backdrop?: ModalBackdrop;
  closable?: boolean;
  draggable?: boolean;
  resizable?: boolean;
  fullscreen?: boolean;
  destroyOnClose?: boolean;
  zIndex?: number;
}

/**
 * Modal header configuration
 */
export interface ModalHeader {
  title?: string;
  showCloseButton?: boolean;
  icon?: string;
  draggable?: boolean;
}

/**
 * Modal footer configuration
 */
export interface ModalFooter {
  showCancelButton?: boolean;
  showOkButton?: boolean;
  cancelText?: string;
  okText?: string;
  okType?: 'primary' | 'secondary' | 'danger';
}

/**
 * Constants
 */
export const EMPTY_STRING = '';
export const DEFAULT_Z_INDEX = 1000;

/**
 * Type guards
 */
export const isModalSize = (value: string): value is ModalSize => {
  return Object.values(ModalSize).includes(value as ModalSize);
};

export const isModalPosition = (value: string): value is ModalPosition => {
  return Object.values(ModalPosition).includes(value as ModalPosition);
};

export const isModalAnimation = (value: string): value is ModalAnimation => {
  return Object.values(ModalAnimation).includes(value as ModalAnimation);
};

export const isModalBackdrop = (value: string): value is ModalBackdrop => {
  return Object.values(ModalBackdrop).includes(value as ModalBackdrop);
};

/**
 * Default configurations
 */
export const DEFAULT_MODAL_CONFIG: Required<ModalConfig> = {
  size: ModalSize.Medium,
  position: ModalPosition.Center,
  animation: ModalAnimation.Fade,
  backdrop: ModalBackdrop.Closable,
  closable: true,
  draggable: false,
  resizable: false,
  fullscreen: false,
  destroyOnClose: false,
  zIndex: DEFAULT_Z_INDEX
};

export const DEFAULT_MODAL_HEADER: Required<ModalHeader> = {
  title: EMPTY_STRING,
  showCloseButton: true,
  icon: EMPTY_STRING,
  draggable: false
};

export const DEFAULT_MODAL_FOOTER: Required<ModalFooter> = {
  showCancelButton: false,
  showOkButton: false,
  cancelText: 'Cancel',
  okText: 'OK',
  okType: 'primary'
};