import { getWorkerInstance } from './worker/worker-init';

export function registerContextInWebWorker(context) {
  if (typeof window !== 'undefined' && window.Worker) {
    const worker = getWorkerInstance();

    const command = "registerContext";
    
    worker.postMessage({
      command,
      payload: {
        context
      }
    });

    worker.addEventListener('message', function(event) {
      if (event.data && event.data.type === 'WORKER_READY') {
        console.log('Worker is ready');
        document.dispatchEvent(new CustomEvent("workerReady"));
      }
    });

    worker.onerror = function(error) {
      console.log('Worker error:', error.message);
    };
  }
}