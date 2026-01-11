import { $applications, $currentApplication } from '../../store/apps';
import { setVar } from '../../store/context';
import { initLocale } from '../../../state/locale.store';

export function setApplication(apps: any) {
  console.log('[setApplication] Received apps:', apps?.length);
  $applications.set(apps);

  // Also update currentApplication if it exists in the new apps list
  const currentApp = $currentApplication.get();
  console.log('[setApplication] Current app UUID:', currentApp?.uuid);
  if (currentApp?.uuid) {
    const updatedApp = apps.find((app: any) => app.uuid === currentApp.uuid);
    console.log('[setApplication] Found updated app:', updatedApp?.name);
    console.log('[setApplication] Updated app i18n:', updatedApp?.i18n);
    if (updatedApp) {
      $currentApplication.set(updatedApp);
      setVar("global", "currentEditingApplication", updatedApp);

      // Sync locale stores when i18n config changes
      if (updatedApp.i18n) {
        console.log('[setApplication] Syncing locale stores with i18n config');
        initLocale(updatedApp.i18n);
      }
    }
  }
}