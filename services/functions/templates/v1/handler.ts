export async function handler(body: any, query: URLSearchParams) {
    // Example logic using body and query
    const name = query.get("name") || "Guest";
    return {
      message: `Hello, ${name}! Your body is: ${JSON.stringify(body)}`
    };
  }