import { $currentApplication } from '../../store/apps';
import { updateApplicationActionHandler } from '../../handlers/applications/handler';
import { setVar } from '../../store/context';
import { initLocale } from '../../../state/locale.store';

export function updateApplication(attribute: any) {
  const updatedApp = {
    ...$currentApplication.get(),
    ...attribute
  };
  $currentApplication.set(updatedApp);

  // Sync locale stores immediately when i18n changes
  if ('i18n' in attribute) {
    initLocale(attribute.i18n);
  }

  updateApplicationActionHandler(updatedApp);
}



export function updateSepecificApplication(application: any) {
  // Update local state immediately for responsive UI
  const currentApp = $currentApplication.get();
  if (currentApp?.uuid === application.uuid) {
    $currentApplication.set(application);
    setVar("global", "currentEditingApplication", application);

    // Sync locale stores when i18n config changes
    initLocale(application.i18n);
  }
  updateApplicationActionHandler(application);
}