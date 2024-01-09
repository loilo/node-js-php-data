import type * as SourceMapTypes from './source-map-types.js'
import * as sourceMap from './source-map-consumer.js'

// @ts-ignore
import wasmUrl from './mappings.wasm?url'
const { SourceMapConsumer } = sourceMap as typeof SourceMapTypes

// @ts-ignore
SourceMapConsumer.initialize({
  'lib/mappings.wasm': wasmUrl
})

export { SourceMapConsumer }
