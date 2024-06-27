import { setDefaultApplicationPageIfNotSet } from "$store/app.action";
import { addPageToApplicationAction, updatePageAction } from "./action";
import { type PageElement } from "./interface"
import { $pages } from "./store";

export const addPageHandler = (page: PageElement, resolve?,reject ?) => {

	fetch(`/api/pages/${window.applicationResponse.uuid}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(page)
	}).then(res => res.json())
		.then(
			(responce) => {
				const { page } = responce;
				if(resolve){
					resolve(page)
				}
				addPageToApplicationAction(page, window.applicationResponse.uuid)
				//setDefaultApplicationPageIfNotSet(page.uuid)
			}
		).catch((error) => {
			if(reject){
				reject(error)
			}
		})

}


export const updatePageHandler = (page: PageElement) => {
	fetch("/api/pages/" + page.application_id + '/'+page.uuid, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(page)
	}).then(res => res.json())
		.then((res) => {
			updatePageAction(res)
		});
}
