import { $applications } from '../../store/apps';

export function setApplication(apps: any) {
  $applications.set(apps);
}