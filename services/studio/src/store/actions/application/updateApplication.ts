import { $currentApplication } from "$store/apps.ts";
import { updateApplicationActionHandler } from "$store/handlers/applications/handler.ts";

export function updateApplication(attribute: any) {
  $currentApplication.set({
    ...$currentApplication.get(),
    ...attribute
  });
  updateApplicationActionHandler($currentApplication.get());
}