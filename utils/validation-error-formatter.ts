export function formatValidationErrors(errors: any[]): string {
  if (errors.length === 0) return "";

  if (errors.length === 1) {
    return `Security violation: ${errors[0].message}`;
  }

  return `Found ${errors.length} security violations:\n${errors.map((e, i) =>
    `${i + 1}. ${e.code || 'Handler'}: ${e.message}`
  ).join('\n')}`;
}
