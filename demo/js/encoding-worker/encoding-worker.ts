// Handle the actual LZ encoding/decoding
import { encode, decode } from './encoding-tools.js'
import {
  DecodingWorkerResponse,
  EncodingWorkerResponse,
  validateMessage
} from './encoding-utils.js'

addEventListener('message', event => {
  let data = event.data
  validateMessage(data)

  switch (data.type) {
    case 'encode':
      postMessage({
        type: 'encoded',
        payload: encode(data.payload),
        id: data.id
      } satisfies EncodingWorkerResponse)
      break

    case 'decode':
      postMessage({
        type: 'decoded',
        payload: decode(data.payload),
        id: data.id
      } satisfies DecodingWorkerResponse)
      break
  }
})
