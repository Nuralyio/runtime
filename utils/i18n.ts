/**
 * @fileoverview Pure Runtime Translation Resolution Utilities
 * @module Runtime/Utils/i18n
 *
 * Provides utilities for resolving translated values from component.translations
 * at runtime. No external i18n libraries - reads from locale stores and returns values.
 *
 * @example
 * ```typescript
 * import { resolveTranslation, resolveComponentProperty } from './i18n';
 *
 * // Resolve a value with translations
 * const text = resolveTranslation('Hello', { fr: 'Bonjour', ar: 'مرحبا' });
 * // Returns 'Bonjour' if current locale is 'fr'
 *
 * // Resolve from component
 * const label = resolveComponentProperty(component, 'value', component.input?.value?.value);
 * ```
 */

import { $locale, $defaultLocale, $fallbackLocale } from '../state/locale.store';
import type { ComponentElement } from '../redux/store/component/component.interface';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Translation map for a single property
 * Key: locale code, Value: translated value
 */
export type TranslationMap = Record<string, any>;

/**
 * Component translations structure
 * Key: property name, Value: translation map
 */
export type ComponentTranslations = Record<string, TranslationMap>;

// ============================================================================
// CORE RESOLUTION FUNCTIONS
// ============================================================================

/**
 * Resolve a value with translation support
 *
 * Resolution priority:
 * 1. If current locale === default locale → return original value
 * 2. If translation exists for current locale → return translation
 * 3. If translation exists for fallback locale → return fallback
 * 4. Return original value (no translation available)
 *
 * @param original - The original/default value from input
 * @param translations - Translation map { locale: value }
 * @param currentLocale - Optional locale override (uses $locale store if not provided)
 * @returns Resolved value for the current locale
 *
 * @example
 * ```typescript
 * // With $locale = 'fr'
 * resolveTranslation('Hello', { fr: 'Bonjour' }); // 'Bonjour'
 *
 * // With $locale = 'en' (default)
 * resolveTranslation('Hello', { fr: 'Bonjour' }); // 'Hello'
 *
 * // Missing translation
 * resolveTranslation('Hello', { es: 'Hola' }); // 'Hello' (with $locale = 'fr')
 * ```
 */
export function resolveTranslation<T>(
  original: T,
  translations?: TranslationMap,
  currentLocale?: string
): T {
  // No translations provided - return original
  if (!translations || Object.keys(translations).length === 0) {
    return original;
  }

  const locale = currentLocale ?? $locale.get();
  const defaultLoc = $defaultLocale.get();
  const fallbackLoc = $fallbackLocale.get();

  // If current locale is the default, always return original value
  // (default locale uses the value from input, not translations)
  if (locale === defaultLoc) {
    return original;
  }

  // Try current locale
  const currentTranslation = translations[locale];
  if (currentTranslation !== undefined && currentTranslation !== '') {
    return currentTranslation as T;
  }

  // Try fallback locale (if different from default)
  if (fallbackLoc !== defaultLoc) {
    const fallbackTranslation = translations[fallbackLoc];
    if (fallbackTranslation !== undefined && fallbackTranslation !== '') {
      return fallbackTranslation as T;
    }
  }

  // Return original value as final fallback
  return original;
}

/**
 * Resolve a component property with translation support
 * Convenience wrapper that extracts translations from component.translations
 *
 * @param component - The component element
 * @param propertyName - Name of the property to resolve (e.g., 'value', 'label')
 * @param originalValue - The original value from input
 * @returns Resolved value for the current locale
 *
 * @example
 * ```typescript
 * const label = resolveComponentProperty(
 *   component,
 *   'label',
 *   component.input?.label?.value
 * );
 * ```
 */
export function resolveComponentProperty<T>(
  component: ComponentElement,
  propertyName: string,
  originalValue: T
): T {
  const translations = component.translations?.[propertyName];
  return resolveTranslation(originalValue, translations);
}

/**
 * Resolve all translatable properties for a component
 * Returns a map of property names to resolved values
 *
 * @param component - The component element
 * @param resolvedInputs - Current resolved inputs object
 * @returns Updated resolved inputs with translations applied
 *
 * @example
 * ```typescript
 * const translated = resolveAllComponentTranslations(component, resolvedInputs);
 * ```
 */
export function resolveAllComponentTranslations(
  component: ComponentElement,
  resolvedInputs: Record<string, any>
): Record<string, any> {
  const translations = component.translations;

  // No translations - return inputs unchanged
  if (!translations || Object.keys(translations).length === 0) {
    return resolvedInputs;
  }

  // Apply translations to each property that has them
  const result = { ...resolvedInputs };

  for (const propertyName of Object.keys(translations)) {
    const original = resolvedInputs[propertyName];

    // Only translate if we have a resolved value
    if (original !== undefined) {
      result[propertyName] = resolveTranslation(
        original,
        translations[propertyName]
      );
    }
  }

  return result;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a component property has any translations defined
 *
 * @param component - The component element
 * @param propertyName - Name of the property
 * @returns Whether translations exist for this property
 */
export function hasTranslation(
  component: ComponentElement,
  propertyName: string
): boolean {
  const translations = component.translations?.[propertyName];
  return translations !== undefined && Object.keys(translations).length > 0;
}

/**
 * Check if a component has any translations at all
 *
 * @param component - The component element
 * @returns Whether the component has any translations
 */
export function hasAnyTranslations(component: ComponentElement): boolean {
  const translations = component.translations;
  if (!translations) return false;

  return Object.values(translations).some(
    propTranslations => Object.keys(propTranslations).length > 0
  );
}

/**
 * Get all property names that have translations
 *
 * @param component - The component element
 * @returns Array of property names with translations
 */
export function getTranslatedProperties(component: ComponentElement): string[] {
  const translations = component.translations;
  if (!translations) return [];

  return Object.keys(translations).filter(
    propName => Object.keys(translations[propName]).length > 0
  );
}

/**
 * Get translation for a specific property and locale
 *
 * @param component - The component element
 * @param propertyName - Property name
 * @param locale - Locale code
 * @returns Translation value or undefined
 */
export function getTranslation(
  component: ComponentElement,
  propertyName: string,
  locale: string
): any | undefined {
  return component.translations?.[propertyName]?.[locale];
}

/**
 * Get all translations for a property
 *
 * @param component - The component element
 * @param propertyName - Property name
 * @returns Translation map or empty object
 */
export function getPropertyTranslations(
  component: ComponentElement,
  propertyName: string
): TranslationMap {
  return component.translations?.[propertyName] || {};
}

// ============================================================================
// STATISTICS FUNCTIONS
// ============================================================================

/**
 * Get translation statistics for a single property
 *
 * @param component - The component element
 * @param propertyName - Property name
 * @param supportedLocales - List of supported locales
 * @param defaultLocale - Default locale (excluded from count)
 * @returns Translation statistics
 */
export function getPropertyTranslationStats(
  component: ComponentElement,
  propertyName: string,
  supportedLocales: string[],
  defaultLocale: string
): {
  total: number;
  translated: number;
  missing: string[];
  percentage: number;
} {
  const otherLocales = supportedLocales.filter(l => l !== defaultLocale);

  if (otherLocales.length === 0) {
    return { total: 0, translated: 0, missing: [], percentage: 100 };
  }

  const translations = component.translations?.[propertyName] || {};
  const missing: string[] = [];

  for (const locale of otherLocales) {
    const value = translations[locale];
    if (value === undefined || value === '') {
      missing.push(locale);
    }
  }

  const total = otherLocales.length;
  const translated = total - missing.length;
  const percentage = total > 0 ? Math.round((translated / total) * 100) : 100;

  return { total, translated, missing, percentage };
}

/**
 * Get translation statistics for an entire component
 *
 * @param component - The component element
 * @param translatableProperties - List of property names that can be translated
 * @param supportedLocales - List of supported locales
 * @param defaultLocale - Default locale (excluded from count)
 * @returns Overall translation statistics
 */
export function getComponentTranslationStats(
  component: ComponentElement,
  translatableProperties: string[],
  supportedLocales: string[],
  defaultLocale: string
): {
  total: number;
  translated: number;
  percentage: number;
  byProperty: Record<string, { translated: number; total: number }>;
} {
  const otherLocales = supportedLocales.filter(l => l !== defaultLocale);

  if (otherLocales.length === 0 || translatableProperties.length === 0) {
    return { total: 0, translated: 0, percentage: 100, byProperty: {} };
  }

  let totalCount = 0;
  let translatedCount = 0;
  const byProperty: Record<string, { translated: number; total: number }> = {};

  for (const propName of translatableProperties) {
    const stats = getPropertyTranslationStats(
      component,
      propName,
      supportedLocales,
      defaultLocale
    );

    byProperty[propName] = {
      translated: stats.translated,
      total: stats.total
    };

    totalCount += stats.total;
    translatedCount += stats.translated;
  }

  const percentage = totalCount > 0
    ? Math.round((translatedCount / totalCount) * 100)
    : 100;

  return {
    total: totalCount,
    translated: translatedCount,
    percentage,
    byProperty
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  resolveTranslation,
  resolveComponentProperty,
  resolveAllComponentTranslations,
  hasTranslation,
  hasAnyTranslations,
  getTranslatedProperties,
  getTranslation,
  getPropertyTranslations,
  getPropertyTranslationStats,
  getComponentTranslationStats
};
