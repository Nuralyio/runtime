export function getNestedAttribute<T>(obj: Record<string, any>, path: string): any {
  return path.split(".").reduce((acc, key) => {
    return acc && acc[key] !== undefined ? acc[key] : undefined;
  }, obj) as T | undefined;
}
  
export function hasOnlyEmptyObjects(error) {
  if (!error || Object.keys(error).length === 0) {
    return true; // The root object is empty
  }

  return Object.values(error).every(value =>
    typeof value === 'object' && value !== null && Object.keys(value).length === 0
  );
}