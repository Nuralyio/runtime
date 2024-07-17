let workerInstance;

export function getWorkerInstance(): Worker {
  if (!workerInstance) {
    workerInstance = new Worker('/worker.js'); // Ensure the correct path
  }
  return workerInstance;
}