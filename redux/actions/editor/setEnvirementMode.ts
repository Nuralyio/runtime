
import { $environment, ViewMode } from '../../store/environment';

export function setEnvirementMode(mode: ViewMode) {
    $environment.set({
        mode: mode
    });
}