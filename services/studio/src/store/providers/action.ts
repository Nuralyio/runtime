import { $providers } from "./store";

export function loadProviders(){

  fetch("/api/providers", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
      $providers.set(data.rsesult);
    })

}