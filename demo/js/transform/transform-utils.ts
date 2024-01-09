export type WorkerMessage = {
  type: 'transform'
  id: string
  payload: {
    code: string
    options: Record<string, any>
  }
}

export type WorkerTransformedResponse = {
  type: 'transformed'
  payload: string
}
export type WorkerErrorResponse = {
  type: 'error'
  payload: {
    message: string
    offset: number
  }
}
export type SimpleWorkerResponse =
  | WorkerTransformedResponse
  | WorkerErrorResponse
export type WorkerResponse = SimpleWorkerResponse & { id: string }

export function ensureRecord(
  message: unknown
): asserts message is Record<string, unknown> {
  if (typeof message !== 'object' || message === null) {
    throw new Error('Invalid message')
  }
}

export function validateMessage(
  message: unknown
): asserts message is WorkerMessage {
  ensureRecord(message)

  if (typeof message.id !== 'string') {
    throw new Error('Invalid message id')
  }

  switch (message.type) {
    case 'transform':
      if (typeof message.payload !== 'object') {
        console.error('Invalid message payload', message.payload)
        throw new Error('Invalid message payload')
      }
      break

    default:
      throw new Error('Invalid message type')
  }
}
