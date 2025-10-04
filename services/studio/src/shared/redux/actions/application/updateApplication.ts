import { $currentApplication } from "@shared/redux/store/apps";
import { updateApplicationActionHandler } from "@shared/redux/handlers/applications/handler";

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