// Handle transforming data in a worker

import type {
  SimpleWorkerResponse,
  WorkerMessage,
  WorkerResponse
} from './transform-utils.js'

let worker = new Worker(new URL('./transform-worker', import.meta.url), {
  type: 'module'
})

export function createTransformer() {
  function transform(data: { code: string; options: Record<string, any> }) {
    return new Promise<SimpleWorkerResponse>(resolve => {
      let id = crypto.randomUUID()

      let messageListener = (event: MessageEvent<WorkerResponse>) => {
        if (event.data?.id !== id) return

        worker.removeEventListener('message', messageListener)
        resolve(event.data)
      }
      worker.addEventListener('message', messageListener)

      worker.postMessage({
        type: 'transform',
        id,
        payload: data
      } satisfies WorkerMessage)
    })
  }

  return { transform }
}
