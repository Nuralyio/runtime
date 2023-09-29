import { $environment, ViewMode } from "./store";

export function setEnvironmentMode(mode: ViewMode) {
  $environment.set({ ...$environment.get(), mode });
}
