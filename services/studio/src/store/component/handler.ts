import { type ComponentElement } from "./interface"
const isServer = typeof window === 'undefined';

export const addComponentHandler = (component: ComponentElement) => {

	fetch("/api/components", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({ ...component , application_id : window.applicationResponse.uuid })
	}).then(res => res.json())
		.catch((err) => {
			console.error(err)
		})

}



export const updateComponentHandler = (component: ComponentElement) => {
	fetch("/api/components/"+component.uuid, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({ ...component , application_id : window.applicationResponse.uuid})
	}).then(res => res.json())
		.catch((err) => {
			console.error(err)
		})
}

if(!isServer){

	}