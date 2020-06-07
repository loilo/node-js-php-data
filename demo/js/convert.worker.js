// Put `eval()` in separate function to avoid leaking variable scope into it
const evaluateIsolated = $$code => eval($$code)

// "window" is needed for the Prettier PHP plugin
self.window = self

// Dynamic imports act as preload
import('../../src/index.js')
import('esprima')
import('./wrap')

export async function convert(code, options) {
  const jsPhpData = require('../../src/index.js').default
  const esprima = await import('esprima')
  const { prefix, suffix } = await import('./wrap')

  const wrappedCode = prefix + code + suffix

  try {
    esprima.parse(wrappedCode)

    const result = await evaluateIsolated(wrappedCode)
    const printed = jsPhpData(result, options)
    return printed
  } catch (error) {
    throw JSON.stringify({ ...error, message: error.message })
  }
}
