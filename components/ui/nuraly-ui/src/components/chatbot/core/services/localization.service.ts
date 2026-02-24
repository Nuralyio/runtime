/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { configureLocalization } from '@lit/localize';
import { sourceLocale, targetLocales } from '../../locales/locale-codes.js';

const LOCALIZATION_KEY = '__nuraly_localization__';

function getOrCreateLocalization() {
  if ((globalThis as any)[LOCALIZATION_KEY]) {
    return (globalThis as any)[LOCALIZATION_KEY];
  }

  const localization = configureLocalization({
    sourceLocale,
    targetLocales,
    loadLocale: (locale: string) => import(`../../locales/generated/${locale}.js`),
  });

  (globalThis as any)[LOCALIZATION_KEY] = localization;
  return localization;
}

export const { getLocale, setLocale } = getOrCreateLocalization();

export const setLocaleFromUrl = async () => {
  const url = new URL(window.location.href);
  const locale = url.searchParams.get('locale') || sourceLocale;
  await setLocale(locale);
};
