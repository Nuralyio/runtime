import { $applications } from "$store/apps.ts";

export function setApplication(apps: any) {
  $applications.set(apps);
}