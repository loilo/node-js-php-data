// Handle LZ encoding/decoding from/to the URL hash in a worker

import { urlState } from './encoding-worker/encoding.js'

// const hasher = Hasher()
let hasher = urlState()

export async function read() {
  return await hasher.read()
}

export async function write(data: any) {
  await hasher.write(data)
  const hash = await hasher.encode(data)
}
