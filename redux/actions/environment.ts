import { $environment, ViewMode } from "../store/environment";

export function setEnvironmentMode(mode: ViewMode) {
  $environment.set({ ...$environment.get(), mode });
}
