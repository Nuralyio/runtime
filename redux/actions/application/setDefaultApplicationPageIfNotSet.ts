import { $currentApplication } from '../../store/apps';
import { updateApplicationActionHandler } from '../../handlers/applications/handler';

export function setDefaultApplicationPageIfNotSet(uuid: string) {
  if (!$currentApplication.get().default_page_uuid) {
    $currentApplication.set({
      ...$currentApplication.get(),
      default_page_uuid: uuid
    });
  }
  updateApplicationActionHandler($currentApplication.get());
}