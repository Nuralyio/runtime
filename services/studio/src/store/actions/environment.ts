import { $environment, ViewMode } from "../environment";

export function setEnvironmentMode(mode: ViewMode) {
  $environment.set({ ...$environment.get(), mode });
}
