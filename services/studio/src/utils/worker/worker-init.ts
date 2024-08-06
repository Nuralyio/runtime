
const worker = new Worker("./worker.ts", { type: "module" })

export function getWorkerInstance(): Worker {
  return worker;
}