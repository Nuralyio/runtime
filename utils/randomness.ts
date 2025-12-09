export const generateRandomId = () => {
  // Generate cryptographically secure random ID
  const randomBytes = crypto.getRandomValues(new Uint8Array(9));
  return Array.from(randomBytes, byte => byte.toString(36)).join('').substring(0, 9);
};