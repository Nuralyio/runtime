/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
interface ImportMetaEnv {
  readonly HOME_APP_UUID: string;
  readonly HOME_PAGE_UUID: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}