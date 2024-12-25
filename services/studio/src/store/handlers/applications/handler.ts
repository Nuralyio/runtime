import { setApplication } from "$store/actions/application/setApplication.ts";
import { closeCreateApplicationModalAction } from "$store/actions/editor/closeCreateApplicationModalAction.ts";
import { setPermissionMessage } from "$store/actions/application/setPermissionMessage.ts";

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


export function deleteApplicationAction(applicationId: any) {

  fetch("/api/applications/" + applicationId, {
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

  fetch("/api/applications/" + application.uuid, {
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