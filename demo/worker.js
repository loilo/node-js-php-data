import * as esprima from 'esprima'

self.window = self
const jsPhpData = require('../src/index.js').default

export async function convert(code, options) {
  const wrappedCode = `(async function input() {\n${code}\n})()`
  console.log('WR', wrappedCode)

  try {
    esprima.parseScript(wrappedCode)

    const result = await eval(wrappedCode)
    return jsPhpData(result, options)
  } catch (error) {
    throw JSON.stringify({ ...error, message: error.message })
  }
}
