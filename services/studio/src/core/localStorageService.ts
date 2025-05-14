// LocalStorageService.ts
export class LocalStorageService {
    static get<T>(key: string, defaultValue: T): T {
      const stored = localStorage.getItem(key);
      try {
        return stored ? JSON.parse(stored) as T : defaultValue;
      } catch {
        return defaultValue;
      }
    }
  
    static set<T>(key: string, value: T): void {
      localStorage.setItem(key, JSON.stringify(value));
    }
  
    static remove(key: string): void {
      localStorage.removeItem(key);
    }
  
    static clear(): void {
      localStorage.clear();
    }
  }