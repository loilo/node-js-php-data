import { EditorView } from '@codemirror/view'
import { tags } from '@lezer/highlight'
import { HighlightStyle } from '@codemirror/language'

const fontFamily =
  '"JetBrains Mono Variable", "Fira Code", "Roboto Mono", Consolas, monospace'
export const colors = {
  // reserved for unidentified tags
  unknown: '#565869',

  background: '#FAFBFC',
  base: '#565869',
  lightGrey: '#ADB1C2',
  green: '#2DAE58',
  teal: '#13BBB7',
  blue: '#09A1ED',
  darkBlue: '#11658F',
  pink: '#F767BB',
  red: '#FF5C56',
  darkYellow: '#CF9C00',
  yellow: '#F5B900'
} as const

const s = (selectors: string[]) => selectors.join(', ')

export const highlightStyle = HighlightStyle.define([
  /**
  A comment.
  */
  { tag: tags.comment, color: colors.lightGrey },

  /**
  A line [comment](https://codemirror.net/6/docs/ref/#highlight.tags.comment).
  */
  { tag: tags.lineComment, color: colors.lightGrey },

  /**
  A block [comment](https://codemirror.net/6/docs/ref/#highlight.tags.comment).
  */
  { tag: tags.blockComment, color: colors.lightGrey },

  /**
  A documentation [comment](https://codemirror.net/6/docs/ref/#highlight.tags.comment).
  */
  { tag: tags.docComment, color: colors.lightGrey },

  /**
  Any kind of identifier.
  */
  { tag: tags.name, color: colors.base },

  /**
  The [name](https://codemirror.net/6/docs/ref/#highlight.tags.name) of a variable.
  */
  { tag: tags.variableName, color: colors.darkBlue },

  /**
  A type [name](https://codemirror.net/6/docs/ref/#highlight.tags.name).
  */
  { tag: tags.typeName, color: colors.green },

  /**
  A tag name (subtag of [`typeName`](https://codemirror.net/6/docs/ref/#highlight.tags.typeName)).
  */
  { tag: tags.tagName, color: colors.teal },

  /**
  A property, field, or attribute [name](https://codemirror.net/6/docs/ref/#highlight.tags.name).
  */
  { tag: tags.propertyName, color: colors.base },

  /**
  The [name](https://codemirror.net/6/docs/ref/#highlight.tags.name) of a class.
  */
  { tag: tags.className, color: colors.pink },

  /**
  A label [name](https://codemirror.net/6/docs/ref/#highlight.tags.name).
  */
  { tag: tags.labelName, color: colors.unknown },

  /**
  A namespace [name](https://codemirror.net/6/docs/ref/#highlight.tags.name).
  */
  { tag: tags.namespace, color: colors.pink },

  /**
  The [name](https://codemirror.net/6/docs/ref/#highlight.tags.name) of a macro.
  */
  { tag: tags.macroName, color: colors.green },

  /**
  A literal value.
  */
  { tag: tags.literal, color: colors.red },

  /**
  A string [literal](https://codemirror.net/6/docs/ref/#highlight.tags.literal).
  */
  { tag: tags.string, color: colors.darkYellow },

  /**
  A documentation [string](https://codemirror.net/6/docs/ref/#highlight.tags.string).
  */
  { tag: tags.docString, color: colors.unknown },

  /**
  A character literal (subtag of [string](https://codemirror.net/6/docs/ref/#highlight.tags.string)).
  */
  { tag: tags.character, color: colors.darkYellow },

  /**
  A number [literal](https://codemirror.net/6/docs/ref/#highlight.tags.literal).
  */
  { tag: tags.number, color: colors.red },

  /**
  An integer [number](https://codemirror.net/6/docs/ref/#highlight.tags.number) literal.
  */
  { tag: tags.integer, color: colors.red },

  /**
  A floating-point [number](https://codemirror.net/6/docs/ref/#highlight.tags.number) literal.
  */
  { tag: tags.float, color: colors.red },

  /**
  A boolean [literal](https://codemirror.net/6/docs/ref/#highlight.tags.literal).
  */
  { tag: tags.bool, color: colors.green },

  /**
  Regular expression [literal](https://codemirror.net/6/docs/ref/#highlight.tags.literal).
  */
  { tag: tags.regexp, color: colors.teal },

  /**
  An escape [literal](https://codemirror.net/6/docs/ref/#highlight.tags.literal), for example a
  backslash escape in a string.
  */
  { tag: tags.escape, color: colors.yellow },

  /**
  A color [literal](https://codemirror.net/6/docs/ref/#highlight.tags.literal).
  */
  { tag: tags.color, color: colors.lightGrey },

  /**
  A URL [literal](https://codemirror.net/6/docs/ref/#highlight.tags.literal).
  */
  { tag: tags.url, color: colors.unknown },

  /**
  A language keyword.
  */
  { tag: tags.keyword, color: colors.pink },

  /**
  The [keyword](https://codemirror.net/6/docs/ref/#highlight.tags.keyword) for the self or this
  object.
  */
  { tag: tags.self, color: colors.teal },

  /**
  The [keyword](https://codemirror.net/6/docs/ref/#highlight.tags.keyword) for null.
  */
  { tag: tags.null, color: colors.green },

  /**
  A [keyword](https://codemirror.net/6/docs/ref/#highlight.tags.keyword) denoting some atomic value.
  */
  { tag: tags.atom, color: colors.green },

  /**
  A [keyword](https://codemirror.net/6/docs/ref/#highlight.tags.keyword) that represents a unit.
  */
  { tag: tags.unit, color: colors.red },

  /**
  A modifier [keyword](https://codemirror.net/6/docs/ref/#highlight.tags.keyword).
  */
  { tag: tags.modifier, color: colors.unknown },

  /**
  A [keyword](https://codemirror.net/6/docs/ref/#highlight.tags.keyword) that acts as an operator.
  */
  { tag: tags.operatorKeyword, color: colors.blue },

  /**
  A control-flow related [keyword](https://codemirror.net/6/docs/ref/#highlight.tags.keyword).
  */
  { tag: tags.controlKeyword, color: colors.pink },

  /**
  A [keyword](https://codemirror.net/6/docs/ref/#highlight.tags.keyword) that defines something.
  */
  { tag: tags.definitionKeyword, color: colors.pink },

  /**
  An operator.
  */
  { tag: tags.operator, color: colors.lightGrey },

  /**
  An [operator](https://codemirror.net/6/docs/ref/#highlight.tags.operator) that defines something.
  */
  { tag: tags.derefOperator, color: colors.lightGrey },

  /**
  Arithmetic-related [operator](https://codemirror.net/6/docs/ref/#highlight.tags.operator).
  */
  { tag: tags.arithmeticOperator, color: colors.lightGrey },

  /**
  Logical [operator](https://codemirror.net/6/docs/ref/#highlight.tags.operator).
  */
  { tag: tags.logicOperator, color: colors.lightGrey },

  /**
  Bit [operator](https://codemirror.net/6/docs/ref/#highlight.tags.operator).
  */
  { tag: tags.bitwiseOperator, color: colors.lightGrey },

  /**
  Comparison [operator](https://codemirror.net/6/docs/ref/#highlight.tags.operator).
  */
  { tag: tags.compareOperator, color: colors.lightGrey },

  /**
  [Operator](https://codemirror.net/6/docs/ref/#highlight.tags.operator) that updates its operand.
  */
  { tag: tags.updateOperator, color: colors.lightGrey },

  /**
  [Operator](https://codemirror.net/6/docs/ref/#highlight.tags.operator) that defines something.
  */
  { tag: tags.definitionOperator, color: colors.lightGrey },

  /**
  Type-related [operator](https://codemirror.net/6/docs/ref/#highlight.tags.operator).
  */
  { tag: tags.typeOperator, color: colors.lightGrey },

  /**
  Control-flow [operator](https://codemirror.net/6/docs/ref/#highlight.tags.operator).
  */
  { tag: tags.controlOperator, color: colors.lightGrey },

  /**
  Program or markup punctuation.
  */
  { tag: tags.punctuation, color: colors.lightGrey },

  /**
  [Punctuation](https://codemirror.net/6/docs/ref/#highlight.tags.punctuation) that separates
  things.
  */
  { tag: tags.separator, color: colors.lightGrey },

  /**
  Bracket-style [punctuation](https://codemirror.net/6/docs/ref/#highlight.tags.punctuation).
  */
  { tag: tags.bracket, color: colors.lightGrey },

  /**
  Angle [brackets](https://codemirror.net/6/docs/ref/#highlight.tags.bracket) (usually `<` and `>`
  tokens).
  */
  { tag: tags.angleBracket, color: colors.lightGrey },

  /**
  Square [brackets](https://codemirror.net/6/docs/ref/#highlight.tags.bracket) (usually `[` and `]`
  tokens).
  */
  { tag: tags.squareBracket, color: colors.lightGrey },

  /**
  Parentheses (usually `(` and `)` tokens). Subtag of
  [bracket](https://codemirror.net/6/docs/ref/#highlight.tags.bracket).
  */
  { tag: tags.paren, color: colors.lightGrey },

  /**
  Braces (usually `{` and `}` tokens). Subtag of
  [bracket](https://codemirror.net/6/docs/ref/#highlight.tags.bracket).
  */
  { tag: tags.brace, color: colors.lightGrey },

  /**
  Content, for example plain text in XML or markup documents.
  */
  { tag: tags.content, color: colors.base },

  /**
  [Content](https://codemirror.net/6/docs/ref/#highlight.tags.content) that represents a heading.
  */
  { tag: tags.heading, color: colors.base },

  /**
  A level 1 [heading](https://codemirror.net/6/docs/ref/#highlight.tags.heading).
  */
  { tag: tags.heading1, color: colors.base },

  /**
  A level 2 [heading](https://codemirror.net/6/docs/ref/#highlight.tags.heading).
  */
  { tag: tags.heading2, color: colors.base },

  /**
  A level 3 [heading](https://codemirror.net/6/docs/ref/#highlight.tags.heading).
  */
  { tag: tags.heading3, color: colors.base },

  /**
  A level 4 [heading](https://codemirror.net/6/docs/ref/#highlight.tags.heading).
  */
  { tag: tags.heading4, color: colors.base },

  /**
  A level 5 [heading](https://codemirror.net/6/docs/ref/#highlight.tags.heading).
  */
  { tag: tags.heading5, color: colors.base },

  /**
  A level 6 [heading](https://codemirror.net/6/docs/ref/#highlight.tags.heading).
  */
  { tag: tags.heading6, color: colors.base },

  /**
  A prose separator (such as a horizontal rule).
  */
  { tag: tags.contentSeparator, color: colors.base },

  /**
  [Content](https://codemirror.net/6/docs/ref/#highlight.tags.content) that represents a list.
  */
  { tag: tags.list, color: colors.base },

  /**
  [Content](https://codemirror.net/6/docs/ref/#highlight.tags.content) that represents a quote.
  */
  { tag: tags.quote, color: colors.base },

  /**
  [Content](https://codemirror.net/6/docs/ref/#highlight.tags.content) that is emphasized.
  */
  { tag: tags.emphasis, fontStyle: 'italic' },

  /**
  [Content](https://codemirror.net/6/docs/ref/#highlight.tags.content) that is styled strong.
  */
  { tag: tags.strong, fontWeight: 'bold' },

  /**
  [Content](https://codemirror.net/6/docs/ref/#highlight.tags.content) that is part of a link.
  */
  { tag: tags.link, color: colors.lightGrey },

  /**
  [Content](https://codemirror.net/6/docs/ref/#highlight.tags.content) that is styled as code or
  monospace.
  */
  {
    tag: tags.monospace,
    fontFamily
  },

  /**
  [Content](https://codemirror.net/6/docs/ref/#highlight.tags.content) that has a strike-through
  style.
  */
  { tag: tags.strikethrough, color: colors.base },

  /**
  Inserted text in a change-tracking format.
  */
  { tag: tags.inserted, color: colors.green, backgroundColor: '#2DAE5824' },

  /**
  Deleted text.
  */
  { tag: tags.deleted, color: colors.red, backgroundcolor: '#FFAEAC44' },

  /**
  Changed text.
  */
  { tag: tags.changed, color: colors.blue, backgroundColor: '#14B1FF33' },

  /**
  An invalid or unsyntactic element.
  */
  { tag: tags.invalid, color: colors.red },

  /**
  Metadata or meta-instruction.
  */
  { tag: tags.meta, color: colors.green },

  /**
  [Metadata](https://codemirror.net/6/docs/ref/#highlight.tags.meta) that applies to the entire
  document.
  */
  { tag: tags.documentMeta, color: colors.lightGrey },

  /**
  [Metadata](https://codemirror.net/6/docs/ref/#highlight.tags.meta) that annotates or adds
  attributes to a given syntactic element.
  */
  { tag: tags.annotation, color: colors.lightGrey },

  /**
  Processing instruction or preprocessor directive. Subtag of
  [meta](https://codemirror.net/6/docs/ref/#highlight.tags.meta).
  */
  { tag: tags.processingInstruction, color: colors.lightGrey }
])

export const theme = EditorView.theme(
  {
    '&': {
      color: colors.base,
      backgroundColor: colors.background
    },
    '.cm-content': {
      caretColor: colors.base,
      fontFamily,
      fontWeight: '350',
      lineHeight: '1.6'
    },
    '&.cm-focused': {
      outline: 'none'
    },
    '.cm-activeLine': {
      backgroundColor: 'transparent'
    },
    '&.cm-focused .cm-matchingBracket': {
      outline: '1px solid #ddd',
      backgroundColor: '#2DAE5822'
    },
    '.cm-lineNumbers .cm-gutterElement': {
      padding: '0 1em 0 1em'
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'transparent'
    },
    '&.cm-focused .cm-activeLineGutter': {
      color: '#F767BB'
    },
    '.cm-selectionMatch': {
      backgroundColor: '#ADB1C255'
    },
    '&.cm-focused .cm-cursor': {
      borderLeftColor: '#000',
      borderLeftWidth: '2px'
    },
    [s([
      '&.cm-focused .cm-selectionBackground',
      '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground',
      '.cm-selectionBackground',
      '.cm-content ::selection'
    ])]: {
      backgroundColor: '#ADB1C235'
    },
    '.cm-gutters': {
      backgroundColor: 'transparent',
      color: '#9194A2aa',
      border: 'none',
      fontFamily
    }
  },
  { dark: false }
)
