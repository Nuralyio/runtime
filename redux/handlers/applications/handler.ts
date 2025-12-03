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


export function deleteApplicationAction(application_id: any) {

  fetch("/api/applications/" + application_id, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    }
  }).then(res => res.json())
    .then((res) => {
      loadOrRefreshApplications();
    });
}

export function updateApplicationActionHandler(application: any) {
const{ uuid } = application;
delete application.uuid;
  fetch("/api/applications/" + uuid, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(application)
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