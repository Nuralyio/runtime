import { logger } from "@nanostores/logger";
import { persistentAtom } from "@nanostores/persistent";
import { atom, keepMount } from "nanostores";

export enum ViewMode {
  Edit = "edit",
  Preview = "preview",
}

export interface Environment {
  mode: ViewMode;
}

export const $environment = atom<Environment>(
  {
    mode: ViewMode.Edit,
  },
  
);

keepMount($environment);

logger({
  environment: $environment,
});
