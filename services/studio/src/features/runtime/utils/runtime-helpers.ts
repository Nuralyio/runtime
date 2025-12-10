import { Observable } from "rxjs";

/**
 * Runtime helper utilities
 * Provides common helper functions used throughout the runtime system
 * and available to handler code execution.
 */
export class RuntimeHelpers {
  /**
   * Capitalizes the first letter of a string
   * @param string - The string to capitalize
   * @returns The string with first letter capitalized
   */
  public static CapitalizeFirstLetter(string: string): string {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  /**
   * Gets the first element of an array
   * @param array - The array to get the first element from
   * @returns The first element or null if array is empty
   */
  public static first(array: any[]): any {
    return array?.[0] ?? null;
  }

  /**
   * Extracts the unit from a CSS value string
   * @param str - CSS value string (e.g., "100px", "50%")
   * @returns The unit portion (e.g., "px", "%") or empty string
   */
  public static extractUnit(str: string) {
    return str?.match(/[a-zA-Z%]+/g)?.[0] || "";
  }

  /**
   * Creates an RxJS Observable from a nanostore
   * @param store - The nanostore to observe
   * @returns Observable that emits on store changes
   */
  public static createStoreObservable(store: any): Observable<void> {
    return new Observable((subscriber) => {
      const unsubscribe = store.subscribe((data: any) => subscriber.next(data));
      return () => unsubscribe();
    });
  }

  /**
   * Checks if a value is a Promise
   * @param value - The value to check
   * @returns True if the value is a Promise
   */
  public static isPromise(value: any) {
    return Boolean(value && typeof value.then === "function");
  }
}
