import { setDefaultApplicationPageIfNotSet } from "$store/app.action";
import { $currentApplication } from "$store/apps";
import { addPageToApplicationAction, /*updatePageAction*/ } from "./action";
import { type PageElement } from "./interface"
import { $pages } from "./page-store";

export const addPageHandler = (page: PageElement, resolve?,reject ?) => {

	fetch(`/api/pages`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({page : {...page, application_id: $currentApplication.get().uuid}})
	}).then(res => res.json())
		.then(
			(responce) => {
				const { page } = responce;
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


export const updatePageHandler = (page: PageElement) => {
	fetch("/api/pages/"+page.uuid, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({page})
	}).then(res => res.json())
		.then((res) => {
		//	updatePageAction(res)
		});
}
