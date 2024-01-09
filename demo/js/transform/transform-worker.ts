// Handle the actual LZ encoding/decoding
import { transform } from './transform-tools.js'
import { type WorkerResponse, validateMessage } from './transform-utils.js'

addEventListener('message', async event => {
  let data = event.data
  validateMessage(data)

  switch (data.type) {
    case 'transform': {
      let response = await transform(data.payload.code, data.payload.options)

      postMessage({
        ...response,
        id: data.id
      } satisfies WorkerResponse)
      break
    }
  }
})
