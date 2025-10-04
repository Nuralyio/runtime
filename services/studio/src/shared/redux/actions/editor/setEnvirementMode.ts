
import { $environment, ViewMode } from "@shared/redux/store/environment";

export function setEnvirementMode(mode: ViewMode) {
    $environment.set({
        mode: mode
    });
}