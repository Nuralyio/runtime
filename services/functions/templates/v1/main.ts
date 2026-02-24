import { handler } from "./handler.ts";

Deno.serve({ port: 8080 }, async (req) => {
  const url = new URL(req.url);
  const query = url.searchParams;

  let body = {};
  if (req.method === "POST" || req.method === "PUT") {
    try {
      body = await req.json();
    } catch {
      body = { error: "Invalid JSON body" };
    }
  }

  const responseObject = await handler(body, query);

  // Returning the response from main.ts
  return new Response(responseObject.message);
});