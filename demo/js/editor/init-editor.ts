import {
  EditorView,
  highlightSpecialChars,
  drawSelection,
  dropCursor,
  highlightActiveLine,
  keymap,
  highlightActiveLineGutter,
  rectangularSelection,
  lineNumbers,
  Decoration,
  type KeyBinding
} from '@codemirror/view'
import { EditorState, Extension, Text } from '@codemirror/state'
import {
  indentOnInput,
  bracketMatching,
  defaultHighlightStyle,
  syntaxHighlighting,
  type LanguageSupport,
  type HighlightStyle
} from '@codemirror/language'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search'
import {
  autocompletion,
  completionKeymap,
  closeBrackets,
  closeBracketsKeymap
} from '@codemirror/autocomplete'
import { lintKeymap } from '@codemirror/lint'
import { indentWithTab } from '@codemirror/commands'

export type SetupFlags = {
  lineNumbers: boolean
}

function getBasicSetup(flags: Partial<SetupFlags> = {}) {
  let options: SetupFlags = {
    lineNumbers: true,
    ...flags
  }

  return [
    options.lineNumbers ? lineNumbers() : undefined,
    highlightActiveLineGutter(),
    highlightSpecialChars(),
    history(),
    drawSelection(),
    dropCursor(),
    EditorState.allowMultipleSelections.of(true),
    indentOnInput(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    bracketMatching(),
    closeBrackets(),
    autocompletion(),
    rectangularSelection(),
    highlightActiveLine(),
    highlightSelectionMatches(),
    keymap.of([
      indentWithTab,
      ...closeBracketsKeymap,
      ...defaultKeymap.filter(map => map.key !== 'Mod-Enter'),
      ...searchKeymap,
      ...historyKeymap,
      ...completionKeymap,
      ...lintKeymap
    ] as readonly KeyBinding[])
  ].filter(Boolean) as Extension
}

export type EditorOptions = {
  lineNumbers?: boolean
  readonly?: boolean
  highlightStyle?: HighlightStyle
  theme?: Extension
  language?: LanguageSupport
  value?: string
  lineWrapping?: boolean
  additionalExtensions?: Extension[]
}

export function initEditor(container: Element, options: EditorOptions = {}) {
  const localOptions = { ...options }

  function getExtensions() {
    const {
      lineNumbers = false,
      readonly = false,
      highlightStyle,
      theme,
      language,
      lineWrapping = false,
      additionalExtensions = []
    } = localOptions

    let extensions: Extension[] = [
      getBasicSetup({
        lineNumbers
      }),
      EditorView.lineWrapping
      // keymap.of([indentWithTab])
    ]

    if (readonly) {
      extensions.push(
        EditorView.editable.of(false),
        EditorView.contentAttributes.of({ tabIndex: '0' })
      )
    }

    if (lineWrapping) {
      extensions.push(EditorView.lineWrapping)
    }

    if (highlightStyle) {
      extensions.push(syntaxHighlighting(highlightStyle))
    }

    if (theme) {
      extensions.push(theme)
    }

    if (language) {
      extensions.push(language)
    }

    extensions.push(...additionalExtensions)

    return extensions
  }

  let editor: EditorView

  function createState() {
    return EditorState.create({
      doc: localOptions.value,
      extensions: getExtensions()
    })
  }

  function createEditor() {
    if (editor) {
      editor.setState(createState())
    } else {
      editor = new EditorView({
        state: createState(),
        parent: container
      })
    }
  }

  createEditor()

  return {
    getEditor() {
      return editor
    },
    getValue() {
      return editor.state.doc.toString()
    },
    setValue(value: string) {
      localOptions.value = value
      editor.setState(createState())
    },
    update(updatedOptions: Partial<EditorOptions> = {}) {
      if (editor) {
        localOptions.value = editor.state.doc.toString()
      }

      Object.assign(localOptions, updatedOptions)

      createEditor()
    }
  }
}
