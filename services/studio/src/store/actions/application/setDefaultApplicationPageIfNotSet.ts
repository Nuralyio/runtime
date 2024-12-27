import { $currentApplication } from "$store/apps.ts";
import { updateApplicationActionHandler } from "$store/handlers/applications/handler.ts";

export function setDefaultApplicationPageIfNotSet(uuid: string) {
  if (!$currentApplication.get().default_page_uuid) {
    $currentApplication.set({
      ...$currentApplication.get(),
      default_page_uuid: uuid
    });
  }
  updateApplicationActionHandler($currentApplication.get());
}