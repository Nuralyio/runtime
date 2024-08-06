import { $environment, ViewMode } from "./environment-store";

export function setEnvironmentMode(mode: ViewMode) {
  $environment.set({ ...$environment.get(), mode });
}
