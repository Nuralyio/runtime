import { type PageElement } from "./interface"

export const addPageHandler = (page: PageElement) => {

	fetch(`/api/pages/${window.applicationResponse.uuid}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(page)
	}).then(res => res.json())
		.then(

			(res) => {
				if (res.ok) {
					return res.json()
				} else {
					console.error(res)
					throw new Error("Error while adding page")
				}
			}

		)

}


export const updatePageHandler = (page: PageElement) => {
	fetch("/api/pages/"+page.uuid, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(page)
	}).then(res => res.json())
		.then((res) => {
			if (res.ok) {
				return res.json()
			} else {
				console.error(res)
				throw new Error("Error while updating page")
			}
		});
}
