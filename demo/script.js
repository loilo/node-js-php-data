import * as OfflinePluginRuntime from 'offline-plugin/runtime'
OfflinePluginRuntime.install()

import CodeMirror from 'codemirror'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/mode/clike/clike'
import 'codemirror/mode/php/php'
import 'codemirror/mode/javascript/javascript'
import { prefix, suffix } from './wrap'

const worker = new Worker('./worker', { type: 'module' })

const uuid = () =>
  ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  )

function debounce(callback, wait, context = this) {
  let timeout = null
  let callbackArgs = null

  const later = () => callback.apply(context, callbackArgs)

  return function () {
    callbackArgs = arguments
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

function getTheme() {
  if (document.documentElement.dataset.theme === 'auto') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  } else {
    return document.documentElement.dataset.theme
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // the line numbers to be "readonly"
  var readOnlyLines = [0]

  const optionsWrapper = document.querySelector('.options')
  const children = Array.from(optionsWrapper.children).slice(0, -1)
  const showAll = document.querySelector('.show-all')
  const themeSwitcher = document.querySelector('#switch-theme')

  function resetForceView() {
    showAll.classList.remove('active')
    for (const item of optionsWrapper.querySelectorAll('.hidden.force-view')) {
      item.removeAttribute('style')
      item.classList.remove('force-view')
    }
  }

  function updateForceViewWidth() {
    const hidden = Array.from(
      optionsWrapper.querySelectorAll('.hidden.force-view')
    )

    let widest = 0
    for (const hiddenItem of hidden) {
      hiddenItem.style.width = 'auto'
      hiddenItem.classList.add('force-view')
      const bounding = hiddenItem.getBoundingClientRect()
      widest = Math.max(widest, bounding.width)
    }

    for (const hiddenItem of hidden) {
      hiddenItem.style.width = `${widest}px`
    }
  }

  showAll.onclick = () => {
    if (showAll.classList.contains('active')) {
      resetForceView()
      return
    }
    showAll.classList.add('active')

    const hidden = Array.from(optionsWrapper.querySelectorAll('.hidden'))
    const fromRight = window.innerWidth - showAll.getBoundingClientRect().right
    let widest = 0
    let offset = Math.round(optionsWrapper.getBoundingClientRect().bottom)
    for (const hiddenItem of hidden) {
      hiddenItem.classList.add('force-view')
      const bounding = hiddenItem.getBoundingClientRect()

      widest = Math.max(widest, bounding.width)
      hiddenItem.style.transform = `translateY(${offset}px)`
      hiddenItem.style.right = `${fromRight}px`

      offset += bounding.height
    }

    for (const hiddenItem of hidden) {
      hiddenItem.style.width = `${widest}px`
    }

    hidden.slice(0).pop().style.borderBottomStyle = 'solid'
  }

  const manageOptions = () => {
    resetForceView()
    showAll.classList.add('hidden')
    for (const child of children) {
      child.classList.remove('hidden')
    }

    const buffer = 30

    if (optionsWrapper.scrollWidth > optionsWrapper.clientWidth) {
      let sum = 0
      const hidden = []

      for (let i = 0; i < children.length; i++) {
        const child = children[i]
        sum += child.getBoundingClientRect().width
        if (sum + buffer > optionsWrapper.clientWidth) {
          hidden.push(...Array.from(children).slice(i))
        }
      }

      for (const hiddenChild of hidden) {
        hiddenChild.classList.add('hidden')
      }

      showAll.classList.remove('hidden')
    } else {
      showAll.classList.add('hidden')
    }
  }

  window.addEventListener('resize', debounce(manageOptions, 200))

  function updateLabel(el) {
    const label = document.querySelector(`label[for="${el.id}"]`)
    const val = String(el.nodeName === 'SELECT' ? el.value : el.checked)

    if (el.nodeName === 'SELECT') {
      if (label.dataset.tpl) {
        label.innerHTML = JSON.parse(label.dataset.tpl)[val]
      } else {
        label.textContent = val
      }
    }
  }

  const msg = document.querySelector('.msg')

  const optionUI = document.querySelectorAll('.option-ui')
  for (const el of optionUI) {
    el.addEventListener('change', () => {
      rewrite()
      updateLabel(el)
      manageOptions()
      updateForceViewWidth()
    })
    updateLabel(el)
  }

  manageOptions()

  // Number of lines prefixed in wrapped, evaluated code
  // (must be discounted when printing error messages)
  const prefixOffsetLines = prefix.match(/\n/g).length
  const suffixLeadingWhitespace = suffix.match(/^\s*/)

  // Line number offset where an "unexpected token }" error happens
  const suffixOffsetLines = suffixLeadingWhitespace
    ? suffixLeadingWhitespace[0].match(/\n/g).length
    : 0

  async function rewrite() {
    const code = inputEditor.getValue()

    const options = {}

    for (const el of optionUI) {
      options[el.dataset.option] =
        el.nodeName === 'SELECT'
          ? isNaN(+el.value)
            ? el.value
            : +el.value
          : el.checked
      updateLabel(el)
    }

    const sentId = uuid()
    worker.postMessage({ code, options, id: sentId })

    const { type, ...result } = await new Promise(resolve => {
      /**
       * @param {MessageEvent} event
       */
      const workerListener = event => {
        const { id, ...data } = event.data
        if (id === sentId) {
          worker.removeEventListener('message', workerListener)
          resolve(data)
        }
      }

      worker.addEventListener('message', workerListener)
    })

    if (type === 'result') {
      outputEditor.setValue(result.code)
    } else {
      const error = {
        ...result,
        toString: () => String(result.message)
      }

      if (typeof error.index !== 'undefined') {
        const nrOfLines = inputEditor.lineCount()

        if (
          new RegExp(
            `^Line ${
              nrOfLines + prefixOffsetLines + suffixOffsetLines
            }: Unexpected token`
          ).test(error.message)
        ) {
          msg.innerHTML = `<li>Unexpected end of input</li>`

          const ch = inputEditor.getLineHandle(nrOfLines - 1).text.length
          marker = inputEditor.markText(
            { line: nrOfLines - 1, ch: ch - 1 },
            { line: nrOfLines - 1, ch },
            {
              className: 'src-err'
            }
          )
        } else {
          msg.innerHTML = `<li>${error.message.replace(
            /^Line ([0-9]+):/,
            (_, lineNr) => `Line ${lineNr - prefixOffsetLines}:`
          )}</li>`

          const { line, ch } = inputEditor.posFromIndex(
            error.index - prefix.length
          )

          marker = inputEditor.markText(
            { line, ch },
            { line, ch: ch + 1 },
            {
              className: 'src-err'
            }
          )
        }
      } else {
        outputEditor.setValue('/* There were errors. See below. */')
        msg.innerHTML = `<li>${error.message}</li>`
      }
    }
  }

  function getEditorTheme() {
    return getTheme() === 'dark' ? 'material-darker' : 'cssedit'
  }

  // create the CodeMirror instance
  const inputEditor = CodeMirror.fromTextArea(
    document.getElementById('input'),
    {
      lineNumbers: true,
      mode: 'javascript',
      indentWithTabs: false,
      smartIndent: true,
      theme: getEditorTheme(),
      lineWrapping: true
    }
  )

  const outputEditor = CodeMirror.fromTextArea(
    document.getElementById('output'),
    {
      mode: 'text/x-php',
      indentWithTabs: false,
      smartIndent: true,
      theme: getEditorTheme(),
      lineWrapping: true,
      readOnly: true
    }
  )

  function updateTheme() {
    const theme = getEditorTheme()
    inputEditor.setOption('theme', theme)
    outputEditor.setOption('theme', theme)
  }

  inputEditor.setOption('extraKeys', {
    Tab(cm) {
      var spaces = Array(cm.getOption('indentUnit') + 1).join(' ')
      cm.replaceSelection(spaces)
    }
  })

  let val = null,
    marker = null

  inputEditor.on('focus', () => {
    resetForceView()
  })
  outputEditor.on('focus', () => {
    resetForceView()
  })

  inputEditor.on('change', () => {
    if (val === inputEditor.getValue()) return

    msg.innerHTML = ''
    if (marker) {
      marker.clear()
      marker = null
    }
    val = inputEditor.getValue()

    rewrite()
  })

  themeSwitcher.onclick = () => {
    switch (document.documentElement.dataset.theme) {
      case 'auto':
        document.documentElement.dataset.theme = 'light'
        localStorage.theme = 'light'
        break

      case 'light':
        document.documentElement.dataset.theme = 'dark'
        localStorage.theme = 'dark'
        break

      case 'dark':
        document.documentElement.dataset.theme = 'auto'
        localStorage.removeItem('theme')
        break
    }

    updateTheme()
  }

  matchMedia('(prefers-color-scheme: dark)').addListener(updateTheme)

  setTimeout(() => {
    inputEditor.refresh()
    outputEditor.refresh()
  }, 400)
})
