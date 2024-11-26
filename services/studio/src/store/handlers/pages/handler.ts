import { $currentApplication } from "$store/apps";
import { addPageToApplicationAction, updatePageAction } from "../../actions/page";
import { type PageElement } from "./interfaces/interface";

export const addPageHandler = (page: PageElement, resolve?,reject ?) => {

	fetch(`/api/pages`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({page : {...page, application_id: $currentApplication.get().uuid}})
	}).then(res => res.json())
		.then(
			(page) => {
				if(resolve){
					resolve(page)
				}
				addPageToApplicationAction(page, $currentApplication.get().uuid)
			}
		).catch((error) => {
			if(reject){
				reject(error)
			}
		})

}


export const updatePageHandler = (page: PageElement, callback: (page: any) => void) => {
	fetch("/api/pages/"+page.uuid, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({page})
	}).then(res => res.json())
		.then((res) => {
		updatePageAction(res,$currentApplication.get().uuid)
			// todo: call the callback when updated
		});
}
