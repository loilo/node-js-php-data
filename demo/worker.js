import * as esprima from 'esprima'
import { prefix, suffix } from './wrap.js'

self.window = self
const jsPhpData = require('../src/index.js').default

onmessage = async event => {
  const { code, options, id } = event.data

  const wrappedCode = prefix + code + suffix

  try {
    esprima.parse(wrappedCode)

    const result = await eval(wrappedCode)
    const resultCode = jsPhpData(result, options)

    postMessage({ type: 'result', id, code: resultCode })
  } catch (error) {
    postMessage({ type: 'error', id, ...error, message: error.message })
  }
}
