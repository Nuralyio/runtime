
import { $environment, ViewMode } from '../../store/environment';
import { ExecuteInstance } from '../../../state/runtime-context';

export function setEnvirementMode(mode: ViewMode) {
    // Update the environment store
    $environment.set({
        ...$environment.get(),
        mode: mode
    });

    // Also update ExecuteInstance.Vars for components using the Vars system
    ExecuteInstance.VarsProxy.currentEditingMode = mode;
}