import { $currentApplication } from '../../store/apps';
import { updateApplicationActionHandler } from '../../handlers/applications/handler';

export function updateApplication(attribute: any) {
  $currentApplication.set({
    ...$currentApplication.get(),
    ...attribute
  });
  updateApplicationActionHandler($currentApplication.get());
}



export function updateSepecificApplication(application: any) {
  updateApplicationActionHandler(application);
}