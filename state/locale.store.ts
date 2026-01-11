/**
 * @fileoverview Pure Runtime Locale State Management
 * @module Runtime/State/LocaleStore
 *
 * Provides reactive locale state using Nanostores.
 * No external i18n libraries - integrates with existing eventDispatcher system.
 *
 * @example
 * ```typescript
 * import { $locale, setLocale, initLocale } from './locale.store';
 *
 * // Initialize with app config
 * initLocale({ defaultLocale: 'en', supportedLocales: ['en', 'fr', 'ar'] });
 *
 * // Get current locale
 * const current = $locale.get();
 *
 * // Set locale (triggers re-render of all components)
 * setLocale('fr');
 *
 * // Subscribe to changes
 * $locale.subscribe(locale => console.log('Locale changed:', locale));
 * ```
 */

import { atom, computed } from 'nanostores';
import { eventDispatcher } from '../utils/change-detection';

// ============================================================================
// CONSTANTS
// ============================================================================

/** Languages that use right-to-left text direction */
const RTL_LOCALES = ['ar', 'he', 'fa', 'ur'];

/** Default locale when none is configured */
const DEFAULT_LOCALE = 'en';

/** LocalStorage key for persisting user preference */
const STORAGE_KEY = 'nuraly-app-locale';

/**
 * Human-readable locale display names
 */
export const LOCALE_DISPLAY_NAMES: Record<string, string> = {
  en: 'English',
  fr: 'Français',
  ar: 'العربية',
  es: 'Español',
  de: 'Deutsch',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
  pt: 'Português',
  it: 'Italiano',
  ru: 'Русский',
  he: 'עברית',
  fa: 'فارسی',
  ur: 'اردو',
  nl: 'Nederlands',
  pl: 'Polski',
  tr: 'Türkçe',
  vi: 'Tiếng Việt',
  th: 'ไทย',
  hi: 'हिन्दी'
};

/**
 * Flag emojis for common locales
 */
export const LOCALE_FLAGS: Record<string, string> = {
  en: '🇬🇧',
  fr: '🇫🇷',
  ar: '🇸🇦',
  es: '🇪🇸',
  de: '🇩🇪',
  zh: '🇨🇳',
  ja: '🇯🇵',
  ko: '🇰🇷',
  pt: '🇧🇷',
  it: '🇮🇹',
  ru: '🇷🇺',
  he: '🇮🇱',
  fa: '🇮🇷',
  ur: '🇵🇰',
  nl: '🇳🇱',
  pl: '🇵🇱',
  tr: '🇹🇷',
  vi: '🇻🇳',
  th: '🇹🇭',
  hi: '🇮🇳'
};

// ============================================================================
// TYPES
// ============================================================================

/**
 * i18n configuration for an application
 */
export interface AppI18nConfig {
  /** Whether i18n is enabled for this application */
  enabled: boolean;

  /** Source/default language code for content authoring (e.g., "en") */
  defaultLocale: string;

  /** Active language shown by default to users and in editor preview */
  activeLocale?: string;

  /** All supported language codes (e.g., ["en", "fr", "ar"]) */
  supportedLocales: string[];

  /** Fallback locale when translation is missing (defaults to defaultLocale) */
  fallbackLocale?: string;

  /** Auto-detect browser language if found in supportedLocales */
  detectBrowserLanguage?: boolean;
}

/**
 * Locale change event data
 */
export interface LocaleChangeEvent {
  /** New locale code */
  locale: string;

  /** Previous locale code */
  previous: string;

  /** Whether new locale is RTL */
  isRTL: boolean;
}

// ============================================================================
// STORES (Nanostores)
// ============================================================================

/**
 * Current active locale code
 * @example $locale.get() // 'en'
 */
export const $locale = atom<string>(DEFAULT_LOCALE);

/**
 * Application's default/source locale
 * This is the language used for original content in input.value
 */
export const $defaultLocale = atom<string>(DEFAULT_LOCALE);

/**
 * Active locale - the default viewing language for users and editor preview
 */
export const $activeLocale = atom<string>(DEFAULT_LOCALE);

/**
 * List of supported locales for the current application
 */
export const $supportedLocales = atom<string[]>([DEFAULT_LOCALE]);

/**
 * Fallback locale when translation is missing
 */
export const $fallbackLocale = atom<string>(DEFAULT_LOCALE);

/**
 * Whether i18n is explicitly enabled in app config
 */
export const $i18nConfigEnabled = atom<boolean>(false);

/**
 * Whether to auto-detect browser language
 */
export const $detectBrowserLanguage = atom<boolean>(true);

/**
 * Computed: Whether current locale uses RTL text direction
 */
export const $isRTL = computed($locale, (locale) => RTL_LOCALES.includes(locale));

/**
 * Computed: Whether i18n is enabled (config enabled AND more than 1 locale)
 */
export const $i18nEnabled = computed(
  [$i18nConfigEnabled, $supportedLocales],
  (enabled, locales) => enabled && locales.length > 1
);

/**
 * Computed: Other locales (excluding default)
 */
export const $otherLocales = computed(
  [$supportedLocales, $defaultLocale],
  (supported, defaultLoc) => supported.filter(l => l !== defaultLoc)
);

// ============================================================================
// FUNCTIONS
// ============================================================================

/**
 * Initialize the locale system with application configuration
 * Should be called when the application loads
 *
 * @param config - Application i18n configuration
 *
 * @example
 * ```typescript
 * initLocale({
 *   defaultLocale: 'en',
 *   supportedLocales: ['en', 'fr', 'ar'],
 *   fallbackLocale: 'en'
 * });
 * ```
 */
export function initLocale(config?: AppI18nConfig): void {
  // No config - use defaults (single locale, no i18n)
  if (!config) {
    $i18nConfigEnabled.set(false);
    $defaultLocale.set(DEFAULT_LOCALE);
    $activeLocale.set(DEFAULT_LOCALE);
    $supportedLocales.set([DEFAULT_LOCALE]);
    $fallbackLocale.set(DEFAULT_LOCALE);
    $detectBrowserLanguage.set(true);
    $locale.set(DEFAULT_LOCALE);
    return;
  }

  // Set enabled state from config
  $i18nConfigEnabled.set(config.enabled ?? false);

  // Validate config
  const defaultLoc = config.defaultLocale || DEFAULT_LOCALE;
  const activeLoc = config.activeLocale || defaultLoc;
  const supported = config.supportedLocales?.length > 0
    ? config.supportedLocales
    : [defaultLoc];
  const fallback = config.fallbackLocale || defaultLoc;
  const detectBrowser = config.detectBrowserLanguage ?? true;

  // Ensure default locale is in supported list
  if (!supported.includes(defaultLoc)) {
    supported.unshift(defaultLoc);
  }

  // Ensure active locale is in supported list
  const effectiveActiveLoc = supported.includes(activeLoc) ? activeLoc : defaultLoc;

  // Check if active locale actually changed (before setting new value)
  const previousActive = $activeLocale.get();
  const activeChanged = previousActive !== effectiveActiveLoc;

  // Set store values
  $defaultLocale.set(defaultLoc);
  $activeLocale.set(effectiveActiveLoc);
  $supportedLocales.set(supported);
  $fallbackLocale.set(fallback);
  $detectBrowserLanguage.set(detectBrowser);

  // Determine initial locale for runtime
  let initialLocale = effectiveActiveLoc;

  // Check localStorage for user preference
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && supported.includes(stored)) {
      initialLocale = stored;
    }
  }

  // Check browser language if detectBrowserLanguage is enabled and no stored preference
  if (detectBrowser && initialLocale === effectiveActiveLoc && typeof navigator !== 'undefined') {
    const browserLang = navigator.language?.split('-')[0];
    if (browserLang && supported.includes(browserLang)) {
      initialLocale = browserLang;
    }
  }

  // Set initial locale (without emitting change event on init)
  $locale.set(initialLocale);

  // Update document attributes
  updateDocumentLocale(initialLocale);

  // Update preview locale to match active locale when it changes (for Studio preview sync)
  if (activeChanged) {
    // Use dynamic import to avoid circular dependency
    import('./runtime-context').then(({ ExecuteInstance }) => {
      if (ExecuteInstance?.VarsProxy) {
        ExecuteInstance.VarsProxy.previewLocale = effectiveActiveLoc;
      }
    }).catch(() => {
      // Ignore if runtime-context is not available (e.g., during SSR)
    });
  }
}

/**
 * Set the current locale
 * Updates document attributes, persists preference, and emits change events
 *
 * @param locale - Locale code to set (e.g., "fr")
 * @returns Whether the locale was successfully set
 *
 * @example
 * ```typescript
 * setLocale('fr'); // Returns true if 'fr' is supported
 * setLocale('xx'); // Returns false, logs warning
 * ```
 */
export function setLocale(locale: string): boolean {
  const supported = $supportedLocales.get();

  // Validate locale is supported
  if (!supported.includes(locale)) {
    console.warn(
      `[i18n] Locale "${locale}" is not supported. ` +
      `Available locales: ${supported.join(', ')}`
    );
    return false;
  }

  const previous = $locale.get();

  // No change needed
  if (previous === locale) {
    return true;
  }

  // Update store
  $locale.set(locale);

  // Update document attributes
  updateDocumentLocale(locale);

  // Persist preference to localStorage
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, locale);
  }

  // Emit change event for InputHandlerController to react
  eventDispatcher.emit('locale:changed', {
    locale,
    previous,
    isRTL: RTL_LOCALES.includes(locale)
  } as LocaleChangeEvent);

  return true;
}

/**
 * Update document attributes for current locale
 * Sets lang and dir attributes on <html> element
 */
function updateDocumentLocale(locale: string): void {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = locale;
    document.documentElement.dir = RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr';
  }
}

/**
 * Get human-readable display name for a locale
 *
 * @param locale - Locale code
 * @returns Display name or uppercase code if not found
 */
export function getLocaleName(locale: string): string {
  return LOCALE_DISPLAY_NAMES[locale] || locale.toUpperCase();
}

/**
 * Get flag emoji for a locale
 *
 * @param locale - Locale code
 * @returns Flag emoji or globe emoji if not found
 */
export function getLocaleFlag(locale: string): string {
  return LOCALE_FLAGS[locale] || '🌐';
}

/**
 * Check if a locale uses RTL text direction
 *
 * @param locale - Locale code
 * @returns Whether the locale is RTL
 */
export function isRTL(locale: string): boolean {
  return RTL_LOCALES.includes(locale);
}

/**
 * Get all RTL locale codes
 */
export function getRTLLocales(): string[] {
  return [...RTL_LOCALES];
}

/**
 * Reset locale to default
 * Useful for testing or clearing user preference
 */
export function resetLocale(): void {
  const defaultLoc = $defaultLocale.get();

  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }

  setLocale(defaultLoc);
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Stores
  $locale,
  $defaultLocale,
  $activeLocale,
  $supportedLocales,
  $fallbackLocale,
  $i18nConfigEnabled,
  $detectBrowserLanguage,
  $isRTL,
  $i18nEnabled,
  $otherLocales,

  // Functions
  initLocale,
  setLocale,
  getLocaleName,
  getLocaleFlag,
  isRTL,
  getRTLLocales,
  resetLocale,

  // Constants
  LOCALE_DISPLAY_NAMES,
  LOCALE_FLAGS
};
