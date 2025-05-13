import { FRONT_API_URLS } from "$store/handlers/api-urls";

export const updateComponentHandler = (component: any, application_id) => {
  const ucomponent = { ...component };
  delete ucomponent.parent
  delete ucomponent.children
  fetch(`${FRONT_API_URLS.COMPONENTS}/${ucomponent.uuid}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      component: { ...ucomponent, application_id }
    })
  }).then(res => res.json())
    .catch((err) => {
      // TODO: dispatch error

      console.error(err);
    });
};
