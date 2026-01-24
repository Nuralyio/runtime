/**
 * WASM Function Template
 *
 * Just write your handler function - no server, no container!
 * Your code runs directly in the WASM sandbox.
 */

interface Context {
    functionId: string;
    functionName: string;
    invocationId: string;
}

/**
 * Main handler function
 */
export function handler(input: any, context: Context) {
    return {
        message: `Hello from ${context.functionName}!`,
        input: input
    };
}

/* ============================================================
 * EXAMPLES - What WASM Functions Can Do
 * ============================================================
 *
 * WASM provides a secure sandbox with these capabilities:
 *
 * ------------------------------------------------------------
 * 1. DATA PROCESSING
 * ------------------------------------------------------------
 *
 * export function handler(input: any, context: Context) {
 *     const numbers = input.numbers || [];
 *     return {
 *         sum: numbers.reduce((a, b) => a + b, 0),
 *         avg: numbers.length ? numbers.reduce((a, b) => a + b, 0) / numbers.length : 0,
 *         min: Math.min(...numbers),
 *         max: Math.max(...numbers),
 *         count: numbers.length
 *     };
 * }
 *
 * ------------------------------------------------------------
 * 2. STRING MANIPULATION
 * ------------------------------------------------------------
 *
 * export function handler(input: any, context: Context) {
 *     const text = input.text || "";
 *     return {
 *         uppercase: text.toUpperCase(),
 *         lowercase: text.toLowerCase(),
 *         reversed: text.split("").reverse().join(""),
 *         wordCount: text.split(/\s+/).filter(Boolean).length,
 *         charCount: text.length
 *     };
 * }
 *
 * ------------------------------------------------------------
 * 3. JSON TRANSFORMATION
 * ------------------------------------------------------------
 *
 * export function handler(input: any, context: Context) {
 *     const users = input.users || [];
 *     return {
 *         // Filter
 *         activeUsers: users.filter(u => u.active),
 *         // Map
 *         emails: users.map(u => u.email),
 *         // Group by
 *         byRole: users.reduce((acc, u) => {
 *             acc[u.role] = acc[u.role] || [];
 *             acc[u.role].push(u);
 *             return acc;
 *         }, {}),
 *         // Sort
 *         sorted: [...users].sort((a, b) => a.name.localeCompare(b.name))
 *     };
 * }
 *
 * ------------------------------------------------------------
 * 4. VALIDATION
 * ------------------------------------------------------------
 *
 * export function handler(input: any, context: Context) {
 *     const errors: string[] = [];
 *
 *     if (!input.email || !input.email.includes("@")) {
 *         errors.push("Invalid email");
 *     }
 *     if (!input.name || input.name.length < 2) {
 *         errors.push("Name must be at least 2 characters");
 *     }
 *     if (!input.age || input.age < 18) {
 *         errors.push("Must be 18 or older");
 *     }
 *
 *     return {
 *         valid: errors.length === 0,
 *         errors: errors
 *     };
 * }
 *
 * ------------------------------------------------------------
 * 5. CALCULATIONS & MATH
 * ------------------------------------------------------------
 *
 * export function handler(input: any, context: Context) {
 *     const { principal, rate, years } = input;
 *
 *     // Compound interest
 *     const compoundInterest = principal * Math.pow(1 + rate / 100, years);
 *
 *     // Loan payment
 *     const monthlyRate = rate / 100 / 12;
 *     const payments = years * 12;
 *     const monthlyPayment = principal *
 *         (monthlyRate * Math.pow(1 + monthlyRate, payments)) /
 *         (Math.pow(1 + monthlyRate, payments) - 1);
 *
 *     return {
 *         futureValue: Math.round(compoundInterest * 100) / 100,
 *         monthlyPayment: Math.round(monthlyPayment * 100) / 100,
 *         totalPaid: Math.round(monthlyPayment * payments * 100) / 100
 *     };
 * }
 *
 * ------------------------------------------------------------
 * 6. DATE/TIME OPERATIONS
 * ------------------------------------------------------------
 *
 * export function handler(input: any, context: Context) {
 *     const date = input.date ? new Date(input.date) : new Date();
 *
 *     return {
 *         iso: date.toISOString(),
 *         timestamp: date.getTime(),
 *         year: date.getFullYear(),
 *         month: date.getMonth() + 1,
 *         day: date.getDate(),
 *         dayOfWeek: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()],
 *         isWeekend: date.getDay() === 0 || date.getDay() === 6
 *     };
 * }
 *
 * ------------------------------------------------------------
 * 7. ENCODING/DECODING
 * ------------------------------------------------------------
 *
 * export function handler(input: any, context: Context) {
 *     const text = input.text || "";
 *
 *     // Base64
 *     const base64 = btoa(text);
 *
 *     // URL encoding
 *     const urlEncoded = encodeURIComponent(text);
 *
 *     // Simple hash (not crypto-secure)
 *     let hash = 0;
 *     for (let i = 0; i < text.length; i++) {
 *         hash = ((hash << 5) - hash) + text.charCodeAt(i);
 *         hash |= 0;
 *     }
 *
 *     return {
 *         original: text,
 *         base64: base64,
 *         urlEncoded: urlEncoded,
 *         hash: Math.abs(hash).toString(16)
 *     };
 * }
 *
 * ------------------------------------------------------------
 * 8. ARRAY ALGORITHMS
 * ------------------------------------------------------------
 *
 * export function handler(input: any, context: Context) {
 *     const arr = input.array || [];
 *
 *     // Remove duplicates
 *     const unique = [...new Set(arr)];
 *
 *     // Flatten nested arrays
 *     const flatten = (a: any[]): any[] =>
 *         a.reduce((acc, val) =>
 *             Array.isArray(val) ? acc.concat(flatten(val)) : acc.concat(val), []);
 *
 *     // Chunk array
 *     const chunkSize = input.chunkSize || 2;
 *     const chunks = [];
 *     for (let i = 0; i < arr.length; i += chunkSize) {
 *         chunks.push(arr.slice(i, i + chunkSize));
 *     }
 *
 *     return {
 *         original: arr,
 *         unique: unique,
 *         flattened: flatten(arr),
 *         chunks: chunks
 *     };
 * }
 *
 * ------------------------------------------------------------
 * 9. TEXT PARSING (CSV, etc.)
 * ------------------------------------------------------------
 *
 * export function handler(input: any, context: Context) {
 *     const csv = input.csv || "name,age\nAlice,30\nBob,25";
 *     const lines = csv.split("\n");
 *     const headers = lines[0].split(",");
 *
 *     const data = lines.slice(1).map(line => {
 *         const values = line.split(",");
 *         return headers.reduce((obj, header, i) => {
 *             obj[header] = values[i];
 *             return obj;
 *         }, {} as Record<string, string>);
 *     });
 *
 *     return {
 *         headers: headers,
 *         rows: data,
 *         rowCount: data.length
 *     };
 * }
 *
 * ------------------------------------------------------------
 * 10. STATE MACHINE / WORKFLOW
 * ------------------------------------------------------------
 *
 * export function handler(input: any, context: Context) {
 *     const { currentState, event } = input;
 *
 *     const transitions: Record<string, Record<string, string>> = {
 *         idle: { start: "running", reset: "idle" },
 *         running: { pause: "paused", stop: "idle", complete: "completed" },
 *         paused: { resume: "running", stop: "idle" },
 *         completed: { reset: "idle" }
 *     };
 *
 *     const nextState = transitions[currentState]?.[event];
 *
 *     return {
 *         previousState: currentState,
 *         event: event,
 *         nextState: nextState || currentState,
 *         valid: !!nextState,
 *         availableEvents: Object.keys(transitions[currentState] || {})
 *     };
 * }
 *
 * ============================================================
 * LIMITATIONS (Security by Design)
 * ============================================================
 *
 * WASM sandbox does NOT allow:
 *
 * - File system access (no fs, no reading/writing files)
 * - Network requests (no fetch, no HTTP calls)
 * - Process spawning (no exec, no child_process)
 * - Environment variables (no process.env)
 * - System calls (no OS-level access)
 * - Random device access (limited randomness)
 *
 * This is intentional for security! Your function is completely
 * isolated and cannot affect the host system.
 *
 * For network/storage access, use the platform's provided
 * capabilities (passed through context or host functions).
 *
 * ============================================================
 */
