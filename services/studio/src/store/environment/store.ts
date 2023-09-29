import { logger } from "@nanostores/logger";
import { persistentAtom } from "@nanostores/persistent";
import { keepMount } from "nanostores";

export enum ViewMode {
  Edit = "edit",
  Preview = "preview",
}

export interface Environment {
  mode: ViewMode;
}

export const $environment = persistentAtom<Environment>(
  "environment",
  {
    mode: ViewMode.Edit,
  },
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  }
);

keepMount($environment);

logger({
  environment: $environment,
});
