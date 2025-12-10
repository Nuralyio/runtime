export function processHeaders(astroHeaders) {
  const headers = {};
  astroHeaders.forEach((value, key) => {
    headers[key] = value;
  });
  delete headers["connection"];
  return headers;
}
  