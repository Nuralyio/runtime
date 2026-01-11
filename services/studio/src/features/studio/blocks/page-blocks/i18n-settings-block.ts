import { COMMON_ATTRIBUTES } from "../../core/helpers/common_attributes.ts";

/**
 * i18n Settings Block
 *
 * UI component for managing application-level internationalization settings.
 * Allows users to configure supported locales, default locale, and fallback behavior.
 */

export default [
  // i18n Settings Container
  {
    uuid: "app_i18n_settings_block",
    application_id: "1",
    name: "app i18n settings block",
    type: "container",
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "flex-direction": "column",
      gap: "8px",
      width: "100%",
      "margin-top": "8px",
      "padding-top": "12px",
      "border-top": "1px solid var(--nuraly-color-border)"
    },
    children_ids: ["app_i18n_settings_label", "app_i18n_enabled_row", "app_i18n_config_container"]
  },
  {
    uuid: "app_i18n_settings_label",
    name: "app i18n settings label",
    type: "text_label",
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "string",
        value: "Internationalization (i18n)"
      }
    },
    style: {
      width: "100%",
      "font-size": "12px",
      "font-weight": "600",
      color: "var(--nuraly-color-text-primary)"
    }
  },
  // Enable i18n toggle row
  {
    uuid: "app_i18n_enabled_row",
    application_id: "1",
    name: "app i18n enabled row",
    type: "container",
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "flex-direction": "row",
      "align-items": "center",
      "justify-content": "space-between",
      gap: "8px",
      width: "100%",
      padding: "8px",
      "background-color": "var(--nuraly-color-background-secondary)",
      "border-radius": "6px"
    },
    children_ids: ["app_i18n_enabled_text", "app_i18n_enabled_toggle"]
  },
  {
    uuid: "app_i18n_enabled_text",
    application_id: "1",
    name: "app i18n enabled text",
    type: "container",
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "flex-direction": "column",
      gap: "2px",
      flex: "1"
    },
    children_ids: ["app_i18n_enabled_title", "app_i18n_enabled_description"]
  },
  {
    uuid: "app_i18n_enabled_title",
    name: "app i18n enabled title",
    type: "text_label",
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "string",
        value: "Enable Multi-language Support"
      }
    },
    style: {
      "font-size": "12px",
      "font-weight": "500",
      color: "var(--nuraly-color-text-primary)"
    }
  },
  {
    uuid: "app_i18n_enabled_description",
    name: "app i18n enabled description",
    type: "text_label",
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "string",
        value: "Allow translations for component text properties"
      }
    },
    style: {
      "font-size": "11px",
      color: "var(--nuraly-color-text-secondary)",
      "line-height": "1.4"
    }
  },
  {
    uuid: "app_i18n_enabled_toggle",
    name: "app i18n enabled toggle",
    type: "checkbox",
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    style: {
      "--nuraly-checkbox-size": "18px"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */ `
          return $currentEditingApplication?.i18n?.enabled === true;
        `
      },
      toggle: { type: "boolean", value: true }
    },
    event: {
      onChange: /* js */ `
        const currentEditingApplication = GetVar("currentEditingApplication");
        if (currentEditingApplication) {
          const currentI18n = currentEditingApplication.i18n || {
            defaultLocale: 'en',
            supportedLocales: ['en'],
            fallbackLocale: 'en'
          };
          UpdateApplication({
            ...currentEditingApplication,
            i18n: {
              ...currentI18n,
              enabled: EventData.checked === true
            }
          });
        }
      `
    }
  },
  // i18n Configuration Container (shown when enabled)
  {
    uuid: "app_i18n_config_container",
    application_id: "1",
    name: "app i18n config container",
    type: "container",
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "flex-direction": "column",
      gap: "12px",
      width: "100%",
      padding: "8px",
      "background-color": "var(--nuraly-color-background)",
      "border-radius": "6px",
      border: "1px solid var(--nuraly-color-border)"
    },
    input: {
      visible: {
        type: "handler",
        value: /* js */ `
          return $currentEditingApplication?.i18n?.enabled === true;
        `
      }
    },
    children_ids: ["app_i18n_default_locale_block", "app_i18n_supported_locales_block", "app_i18n_active_locale_block"]
  },
  // Default Locale Selection
  {
    uuid: "app_i18n_default_locale_block",
    application_id: "1",
    name: "app i18n default locale block",
    type: "container",
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "flex-direction": "column",
      gap: "4px",
      width: "100%"
    },
    children_ids: ["app_i18n_default_locale_label", "app_i18n_default_locale_select"]
  },
  {
    uuid: "app_i18n_default_locale_label",
    name: "app i18n default locale label",
    type: "text_label",
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "string",
        value: "Default Language"
      }
    },
    style: {
      "font-size": "11px",
      "font-weight": "500",
      color: "var(--nuraly-color-text-secondary)"
    }
  },
  {
    uuid: "app_i18n_default_locale_select",
    name: "app i18n default locale select",
    type: "select",
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    style: {
      width: "100%",
      size: "small"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */ `
          return $currentEditingApplication?.i18n?.defaultLocale || 'en';
        `
      },
      options: {
        type: "object",
        value: [
          { label: "🇺🇸 English", value: "en" },
          { label: "🇫🇷 French", value: "fr" },
          { label: "🇪🇸 Spanish", value: "es" },
          { label: "🇩🇪 German", value: "de" },
          { label: "🇮🇹 Italian", value: "it" },
          { label: "🇵🇹 Portuguese", value: "pt" },
          { label: "🇷🇺 Russian", value: "ru" },
          { label: "🇨🇳 Chinese", value: "zh" },
          { label: "🇯🇵 Japanese", value: "ja" },
          { label: "🇰🇷 Korean", value: "ko" },
          { label: "🇸🇦 Arabic", value: "ar" },
          { label: "🇮🇱 Hebrew", value: "he" },
          { label: "🇹🇷 Turkish", value: "tr" },
          { label: "🇳🇱 Dutch", value: "nl" },
          { label: "🇵🇱 Polish", value: "pl" }
        ]
      }
    },
    event: {
      onChange: /* js */ `
        const currentEditingApplication = GetVar("currentEditingApplication");
        if (currentEditingApplication) {
          const newLocale = EventData.value;
          const currentI18n = currentEditingApplication.i18n || { defaultLocale: 'en', supportedLocales: ['en'], fallbackLocale: 'en' };
          const currentLocales = currentI18n.supportedLocales || [];

          // Ensure default locale is in supported locales
          const supportedLocales = currentLocales.includes(newLocale)
            ? currentLocales
            : [newLocale, ...currentLocales];

          UpdateApplication({
            ...currentEditingApplication,
            i18n: {
              ...currentI18n,
              defaultLocale: newLocale,
              supportedLocales: supportedLocales,
              fallbackLocale: newLocale
            }
          });
        }
      `
    }
  },
  // Supported Locales Selection
  {
    uuid: "app_i18n_supported_locales_block",
    application_id: "1",
    name: "app i18n supported locales block",
    type: "container",
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "flex-direction": "column",
      gap: "4px",
      width: "100%"
    },
    children_ids: ["app_i18n_supported_locales_label", "app_i18n_supported_locales_select"]
  },
  {
    uuid: "app_i18n_supported_locales_label",
    name: "app i18n supported locales label",
    type: "text_label",
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "string",
        value: "Supported Languages"
      }
    },
    style: {
      "font-size": "11px",
      "font-weight": "500",
      color: "var(--nuraly-color-text-secondary)"
    }
  },
  {
    uuid: "app_i18n_supported_locales_select",
    name: "app i18n supported locales select",
    type: "select",
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    style: {
      width: "100%",
      size: "small"
    },
    input: {
      selectionMode: { type: "string", value: "multiple" },
      value: {
        type: "handler",
        value: /* js */ `
          return $currentEditingApplication?.i18n?.supportedLocales || ['en'];
        `
      },
      options: {
        type: "object",
        value: [
          { label: "🇺🇸 English", value: "en" },
          { label: "🇫🇷 French", value: "fr" },
          { label: "🇪🇸 Spanish", value: "es" },
          { label: "🇩🇪 German", value: "de" },
          { label: "🇮🇹 Italian", value: "it" },
          { label: "🇵🇹 Portuguese", value: "pt" },
          { label: "🇷🇺 Russian", value: "ru" },
          { label: "🇨🇳 Chinese", value: "zh" },
          { label: "🇯🇵 Japanese", value: "ja" },
          { label: "🇰🇷 Korean", value: "ko" },
          { label: "🇸🇦 Arabic", value: "ar" },
          { label: "🇮🇱 Hebrew", value: "he" },
          { label: "🇹🇷 Turkish", value: "tr" },
          { label: "🇳🇱 Dutch", value: "nl" },
          { label: "🇵🇱 Polish", value: "pl" }
        ]
      }
    },
    event: {
      onChange: /* js */ `
        const currentEditingApplication = GetVar("currentEditingApplication");
        if (currentEditingApplication) {
          const currentI18n = currentEditingApplication.i18n || { defaultLocale: 'en', supportedLocales: ['en'], fallbackLocale: 'en' };
          const selectedLocales = Array.isArray(EventData.value) ? EventData.value : [EventData.value];
          const defaultLocale = currentI18n.defaultLocale || 'en';

          // Ensure default locale is always included
          const supportedLocales = selectedLocales.includes(defaultLocale)
            ? selectedLocales
            : [defaultLocale, ...selectedLocales];

          UpdateApplication({
            ...currentEditingApplication,
            i18n: {
              ...currentI18n,
              supportedLocales: supportedLocales
            }
          });
        }
      `
    }
  },
  // Active Locale Selection (runtime default)
  {
    uuid: "app_i18n_active_locale_block",
    application_id: "1",
    name: "app i18n active locale block",
    type: "container",
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "flex-direction": "column",
      gap: "4px",
      width: "100%"
    },
    children_ids: ["app_i18n_active_locale_label", "app_i18n_active_locale_select"]
  },
  {
    uuid: "app_i18n_active_locale_label",
    name: "app i18n active locale label",
    type: "text_label",
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "string",
        value: "Active Language (Runtime Default)"
      }
    },
    style: {
      "font-size": "11px",
      "font-weight": "500",
      color: "var(--nuraly-color-text-secondary)"
    }
  },
  {
    uuid: "app_i18n_active_locale_select",
    name: "app i18n active locale select",
    type: "select",
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    style: {
      width: "100%",
      size: "small"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */ `
          const i18n = $currentEditingApplication?.i18n;
          if (i18n?.detectBrowserLanguage === true) return 'auto';
          return i18n?.activeLocale || i18n?.defaultLocale || 'en';
        `
      },
      options: {
        type: "handler",
        value: /* js */ `
          const supportedLocales = $currentEditingApplication?.i18n?.supportedLocales || ['en'];
          const flags = { en: '🇺🇸', fr: '🇫🇷', es: '🇪🇸', de: '🇩🇪', it: '🇮🇹', pt: '🇵🇹', ru: '🇷🇺', zh: '🇨🇳', ja: '🇯🇵', ko: '🇰🇷', ar: '🇸🇦', he: '🇮🇱', tr: '🇹🇷', nl: '🇳🇱', pl: '🇵🇱' };
          const names = { en: 'English', fr: 'French', es: 'Spanish', de: 'German', it: 'Italian', pt: 'Portuguese', ru: 'Russian', zh: 'Chinese', ja: 'Japanese', ko: 'Korean', ar: 'Arabic', he: 'Hebrew', tr: 'Turkish', nl: 'Dutch', pl: 'Polish' };
          const localeOptions = supportedLocales.map(locale => ({
            label: (flags[locale] || '🌐') + ' ' + (names[locale] || locale.toUpperCase()),
            value: locale
          }));
          return [
            { label: '🌐 Auto-detect (Browser)', value: 'auto' },
            ...localeOptions
          ];
        `
      }
    },
    event: {
      onChange: /* js */ `
        const currentEditingApplication = GetVar("currentEditingApplication");
        if (currentEditingApplication) {
          const currentI18n = currentEditingApplication.i18n || { defaultLocale: 'en', supportedLocales: ['en'], fallbackLocale: 'en' };
          const isAuto = EventData.value === 'auto';
          UpdateApplication({
            ...currentEditingApplication,
            i18n: {
              ...currentI18n,
              activeLocale: isAuto ? currentI18n.defaultLocale : EventData.value,
              detectBrowserLanguage: isAuto
            }
          });
        }
      `
    }
  }
];
