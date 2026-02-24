export function removeNullProperties(obj: any): any {
    return Object.fromEntries(
        Object.entries(obj).filter(([key, value]) => value !== null)
    );
}