import { $applications } from "@shared/redux/store/apps";

export function setApplication(apps: any) {
  $applications.set(apps);
}