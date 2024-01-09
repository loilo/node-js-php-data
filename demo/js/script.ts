import '@fontsource-variable/jetbrains-mono'

import { javascript } from '@codemirror/lang-javascript'
import { php } from '@codemirror/lang-php'
import { Diagnostic, lintGutter, linter } from '@codemirror/lint'
import { EditorView } from '@codemirror/view'
import { debounce } from 'lodash-es'
import * as darkTheme from './editor/dark-theme.js'
import { initEditor } from './editor/init-editor.js'
import * as lightTheme from './editor/light-theme.js'
import { createTransformer } from './transform/transform.js'
import * as urlState from './url-state.js'

const transformer = createTransformer()

let initialized = false

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

  const optionsWrapper = document.querySelector<HTMLElement>('.options')!
  const children = Array.from(optionsWrapper.children).slice(0, -1)
  const showAll = document.querySelector<HTMLElement>('.show-all')!
  const themeSwitcher = document.querySelector<HTMLElement>('#switch-theme')!

  function resetForceView() {
    showAll.classList.remove('active')
    for (const item of optionsWrapper.querySelectorAll('.hidden.force-view')) {
      item.removeAttribute('style')
      item.classList.remove('force-view')
    }
  }

  function updateForceViewWidth() {
    const hidden = Array.from(
      optionsWrapper.querySelectorAll<HTMLElement>('.hidden.force-view')
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

    const hidden = Array.from(
      optionsWrapper.querySelectorAll<HTMLElement>('.hidden')
    )
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

    hidden.slice(0)!.pop()!.style.borderBottomStyle = 'solid'
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

  function updateLabel(el: HTMLInputElement | HTMLSelectElement) {
    const label = document.querySelector<HTMLElement>(`label[for="${el.id}"]`)!
    const val = String(
      el.nodeName === 'SELECT' ? el.value : (el as HTMLInputElement).checked
    )

    if (el.nodeName === 'SELECT') {
      if (label.dataset.tpl) {
        label.innerHTML = JSON.parse(label.dataset.tpl)[val]
      } else {
        label.textContent = val
      }
    }
  }

  const optionUI = document.querySelectorAll<
    HTMLSelectElement | HTMLInputElement
  >('.option-ui')
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

  async function rewrite(shouldSave = true) {
    if (!initialized) return

    const code = inputEditor.getValue()

    const options: Record<string, any> = {}

    for (const el of optionUI) {
      options[el.dataset.option!] =
        el.nodeName === 'SELECT'
          ? isNaN(+el.value)
            ? el.value
            : +el.value
          : (el as HTMLInputElement).checked
      updateLabel(el)
    }

    if (shouldSave) {
      save()
    }

    const result = await transformer.transform({ code, options })

    if (result.type === 'transformed') {
      inputError = undefined
      setOutputErrorNotice.cancel()
      outputEditor.setValue(result.payload as string)
    } else {
      inputError = result.payload
      setOutputErrorNotice()
    }
  }

  function getEditorTheme() {
    return getTheme() === 'dark' ? darkTheme : lightTheme
  }

  let inputError:
    | {
        offset: number
        message: string
      }
    | undefined

  // create the CodeMirror instance
  const additionalInputExtensions = [
    EditorView.domEventHandlers({
      focus() {
        resetForceView()
      }
    }),
    EditorView.updateListener.of(update => {
      if (update.docChanged) {
        changeHandler()
      }
    }),
    lintGutter(),
    linter(() => {
      const diagnostics: Diagnostic[] = []

      if (inputError) {
        diagnostics.push({
          from: inputError.offset,
          to: inputError.offset,
          severity: 'error',
          message: inputError.message,
          source: 'Input Error'
        })
      }

      return diagnostics
    })
  ]
  const inputElement = document.getElementById('input')!
  const inputEditor = initEditor(inputElement, {
    value: inputElement.dataset.content,
    lineNumbers: true,
    language: javascript(),
    lineWrapping: true,
    additionalExtensions: additionalInputExtensions,
    ...getEditorTheme()
  })

  const outputElement = document.getElementById('output')!
  const outputEditor = initEditor(outputElement, {
    value: outputElement.dataset.content,
    lineNumbers: true,
    language: php({
      plain: true
    }),
    readonly: true,
    lineWrapping: true,
    ...getEditorTheme()
  })

  const setOutputErrorNotice = debounce(() => {
    outputEditor.setValue('// Error in JavaScript input')
  }, 500)

  function updateTheme() {
    inputEditor.update(getEditorTheme())
    outputEditor.update(getEditorTheme())
  }

  let val: string

  const changeHandler = debounce(() => {
    if (val === inputEditor.getValue()) return

    val = inputEditor.getValue()

    rewrite()
  }, 50)

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

  function restoreOptions(options: Record<string, boolean | string>) {
    for (const [id, value] of Object.entries(options)) {
      const element = document.getElementById(id) as
        | HTMLSelectElement
        | HTMLInputElement
      if (typeof value === 'boolean') {
        ;(element as HTMLInputElement).checked = value
      } else {
        ;(element as HTMLSelectElement).value = value
      }
      element.dispatchEvent(new Event('change'))
    }
  }

  async function load() {
    const state = await urlState.read()

    if (state === null) {
      return
    }

    restoreOptions(state.options)
    inputEditor.setValue(state.input)
  }

  function save() {
    return urlState.write({
      input: inputEditor.getValue(),
      options: Object.fromEntries(
        [
          'typecast-objects',
          'bracket-arrays',
          'trailing-commas',
          'indentation',
          'quotes',
          'remove-undefined',
          'on-circular'
        ].map(id => {
          const element = document.getElementById(id) as
            | HTMLInputElement
            | HTMLSelectElement
          if (element.type === 'checkbox') {
            return [id, (element as HTMLInputElement).checked]
          } else {
            return [id, (element as HTMLSelectElement).value]
          }
        })
      )
    })
  }

  load().then(() => {
    initialized = true
    rewrite(false)
  })
})
