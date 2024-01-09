// Handle LZ encoding/decoding from/to the URL hash in a worker

import type {
  WorkerMessage,
  EncodingWorkerResponse,
  DecodingWorkerResponse
} from './encoding-utils.js'

let worker = new Worker(new URL('./encoding-worker', import.meta.url), {
  type: 'module'
})

export function urlState<T = any>() {
  function decode(serialized: string) {
    return new Promise<T>(resolve => {
      let id = crypto.randomUUID()

      let messageListener = (event: MessageEvent<DecodingWorkerResponse>) => {
        if (event.data?.id !== id) return

        worker.removeEventListener('message', messageListener)
        resolve(event.data.payload)
      }
      worker.addEventListener('message', messageListener)

      worker.postMessage({
        type: 'decode',
        id,
        payload: serialized
      } satisfies WorkerMessage)
    })
  }

  async function read() {
    const hash = document.location.hash.slice(1)
    if (!hash) {
      return null
    }

    try {
      return decode(hash)
    } catch {
      return null
    }
  }

  function encode(data: T) {
    return new Promise<string>(resolve => {
      let id = crypto.randomUUID()

      let messageListener = (event: MessageEvent<EncodingWorkerResponse>) => {
        if (event.data?.id !== id) return

        worker.removeEventListener('message', messageListener)
        resolve(event.data.payload)
      }
      worker.addEventListener('message', messageListener)

      worker.postMessage({
        type: 'encode',
        id,
        payload: data
      } satisfies WorkerMessage)
    })
  }

  async function write(data: T) {
    let hash = await encode(data)

    const url = new URL(window.location.href)
    url.hash = hash
    history.replaceState(history.state, '', url.href)
  }

  return { read, write, encode, decode }
}
