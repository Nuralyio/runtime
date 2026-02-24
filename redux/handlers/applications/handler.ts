import { setApplication } from '../../actions/application/setApplication';
import { closeCreateApplicationModalAction } from '../../actions/editor/closeCreateApplicationModalAction';
import { setPermissionMessage } from '../../actions/application/setPermissionMessage';

export function loadOrRefreshApplications() {

  fetch("/api/applications", {
    method: "GET"
  }).then(res => res.json())
    .then((res) => {
      setApplication(res);
      closeCreateApplicationModalAction();
    });
}


export function createApplicationAction(application: any) {

  fetch("/api/applications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(application)
  }).then(res => res.json())
    .then((res) => {
      loadOrRefreshApplications();
    });
}


export function deleteApplicationAction(application_id: any): Promise<any> {
  return fetch("/api/applications/" + application_id, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    }
  }).then(res => res.json())
    .then((res) => {
      loadOrRefreshApplications();
      return res;
    });
}

export function updateApplicationActionHandler(application: any) {
  const { uuid, ...rest } = application;

  // Filter out null and undefined values to avoid validation errors
  const filteredApplication = Object.fromEntries(
    Object.entries(rest).filter(([_, value]) => value !== null && value !== undefined)
  );

  fetch("/api/applications/" + uuid, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(filteredApplication)
  }).then(res => res.json())
    .then((res) => {
      loadOrRefreshApplications();
    });
}

export function addPermission({ resource_id, resource_type, user_id, permission_type }) {

  fetch("/api/permissions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      resource_id,
      resource_type,
      permission_type,
      user_id
    })
  }).then(res => res.json())
    .then((res) => {
      setPermissionMessage(res.message);
    });
}