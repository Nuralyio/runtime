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
      
      $providers.set(data.rsesult);
    })

}