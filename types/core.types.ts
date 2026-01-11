import type { ComponentElement } from '../redux/store/component/component.interface';

export interface Extrats {
  event?: Event | CustomEvent | MouseEvent | KeyboardEvent | InputEvent;

  [key: string]: any;
}

export interface ServiceWorkerMessage {
  funtionNameToExecute: string;
  component: ComponentElement;
  syncResponse?: string;
  eventData?: any;
  args: object;
}

/**
 * i18n configuration for an application
 * Defines which languages the application supports
 */
export interface AppI18nConfig {
  /**
   * Source/default language code (e.g., "en")
   * This is the language used for original content in input.value
   */
  defaultLocale: string;

  /**
   * All supported language codes (e.g., ["en", "fr", "ar"])
   * Must include defaultLocale
   */
  supportedLocales: string[];

  /**
   * Fallback locale when translation is missing
   * Defaults to defaultLocale if not specified
   */
  fallbackLocale?: string;
}

export interface Application {
  default_page_uuid?: string;
  name: string;
  uuid: string;

  /**
   * i18n configuration for the application
   * If not provided, the app is single-language (no translations)
   */
  i18n?: AppI18nConfig;
}

export interface Execute {
  eventId?: string;
  component: ComponentElement;
  type: string;
  extras?: Extrats;
}