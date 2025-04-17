
import { $environment, type Environment, ViewMode } from "$store/environment";

export function setEnvirementMode(mode: ViewMode) {
    $environment.set({
        mode: mode
    });
}