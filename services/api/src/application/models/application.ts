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
  /** Fallback locale when translation is missing */
  fallbackLocale?: string;
  /** Auto-detect browser language if found in supportedLocales */
  detectBrowserLanguage?: boolean;
}

export class Application {

    published?: boolean | null;
    uuid: string;
    user_id: string;
    name: string;
    subdomain?: string | null;
    requiresAuthOnly: boolean; // When true, any authenticated user can access (no role/member check needed)
    i18n?: AppI18nConfig | null; // Internationalization configuration
    publishedAt?: Date | null; // When the app was last published

    constructor(
      published: boolean,
      name: string,
      uuid: string,
      user_id: string,
      subdomain?: string | null,
      requiresAuthOnly: boolean = false,
      i18n?: AppI18nConfig | null,
      publishedAt?: Date | null
    ) {
      this.published = published;
      this.name = name;
      this.uuid = uuid;
      this.user_id = user_id;
      this.subdomain = subdomain;
      this.requiresAuthOnly = requiresAuthOnly;
      this.i18n = i18n;
      this.publishedAt = publishedAt;
    }
  }
  