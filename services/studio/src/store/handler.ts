import { closeCreateApplicationModalAction, setApplication } from "./app.action"

export function loadOrRefreshApplications(){

	fetch("/api/applications" , {
		method : "GET"
	}).then(res => res.json())
	.then((res) => {
		setApplication(res);
		closeCreateApplicationModalAction();
	})
}


export function createApplicationAction(application : any){

	fetch("/api/applications" , {
		method : "POST",
		headers: {
			'Content-Type': 'application/json'
		},
		body : JSON.stringify(application)
	}).then(res => res.json())
	.then((res) => {
		loadOrRefreshApplications();
	})
}


export function deleteApplicationAction(applicationId : any){

	fetch("/api/applications/" + applicationId , {
		method : "DELETE",
		headers: {
			'Content-Type': 'application/json'
		},
	}).then(res => res.json())
	.then((res) => {
		loadOrRefreshApplications();
	})
}