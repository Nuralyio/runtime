export function getNestedAttribute<T>(obj: Record<string, any>, path: string): any {
    return path.split('.').reduce((acc, key) => {
      return acc && acc[key] !== undefined ? acc[key] : undefined;
    }, obj) as T | undefined;
  }
  