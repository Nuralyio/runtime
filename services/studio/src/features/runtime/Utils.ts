import { Observable } from "rxjs";

export class Utils {
    public static CapitalizeFirstLetter(string: string): string {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    public static first(array: any[]): any {
        return array?.[0] ?? null;
    }

    public static extractUnit(str :string) {
        return str?.match(/[a-zA-Z%]+/g)?.[0] || "";
    }
    public static createStoreObservable(store: any): Observable<void> {
        return new Observable((subscriber) => {
          const unsubscribe = store.subscribe((data) => subscriber.next(data));
          return () => unsubscribe();
        });
      }

      public static  isPromise(value) {
        return Boolean(value && typeof value.then === "function");
    }

}