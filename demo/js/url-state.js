// Handle LZ encoding/decoding from/to the URL hash in a worker

import Hasher from 'workerize-loader!./hash.worker'

const hasher = Hasher()

export async function read() {
  const hash = document.location.hash.slice(1)
  if (!hash) {
    return null
  }

  try {
    return JSON.parse(await hasher.decode(hash))
  } catch (_) {
    return {}
  }
}

export async function write(data) {
  const hash = await hasher.encode(JSON.stringify(data))

  if (
    typeof URL === 'function' &&
    typeof history === 'object' &&
    typeof history.replaceState === 'function'
  ) {
    const url = new URL(location)
    url.hash = hash
    history.replaceState(null, null, url.href)
  } else {
    location.hash = hash
  }
}
