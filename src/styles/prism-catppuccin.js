// Catppuccin Mocha — matches your site's CSS variable palette exactly.
// Used in both PostPage (blog code blocks) and DsaPage (code viewer).
// Token colours are hardcoded because Prism styles run outside the CSS cascade.

const t = {
  base:      '#cdd6f4', // --text
  surface:   '#181825', // --surface
  subtext1:  '#bac2de',
  subtext0:  '#a6adc8',
  muted:     '#6c7086', // --muted-ish
  overlay2:  '#9399b2',
  red:       '#f38ba8',
  peach:     '#fab387',
  yellow:    '#f9e2af',
  green:     '#a6e3a1',
  teal:      '#94e2d5',
  sky:       '#89dceb',
  sapphire:  '#74c7ec',
  blue:      '#89b4fa',
  lavender:  '#b4befe',
  mauve:     '#cba6f7', // --accent
  pink:      '#f5c2e7',
  flamingo:  '#f2cdcd',
  maroon:    '#eba0ac',
  rosewater: '#f5e0dc',
}

/** @type {import('react-syntax-highlighter').SyntaxHighlighterProps['style']} */
const catppuccinMocha = {
  'code[class*="language-"]': {
    color: t.base,
    background: 'none',
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
    fontSize: '0.875rem',
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    wordWrap: 'normal',
    lineHeight: '1.75',
    tabSize: '2',
    hyphens: 'none',
  },
  'pre[class*="language-"]': {
    color: t.base,
    background: t.surface,
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
    fontSize: '0.875rem',
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    wordWrap: 'normal',
    lineHeight: '1.75',
    tabSize: '2',
    hyphens: 'none',
    padding: '1.25rem 1.5rem',
    margin: '0',
    overflow: 'auto',
  },
  // --- structural
  'comment':            { color: t.muted, fontStyle: 'italic' },
  'block-comment':      { color: t.muted, fontStyle: 'italic' },
  'prolog':             { color: t.muted },
  'doctype':            { color: t.muted },
  'cdata':              { color: t.muted },
  'punctuation':        { color: t.subtext0 },
  'namespace':          { color: t.subtext1, opacity: '0.8' },
  // --- declarations
  'property':           { color: t.blue },
  'tag':                { color: t.red },
  'boolean':            { color: t.peach },
  'number':             { color: t.peach },
  'constant':           { color: t.peach },
  'symbol':             { color: t.flamingo },
  'deleted':            { color: t.red },
  'selector':           { color: t.green },
  'attr-name':          { color: t.yellow },
  'string':             { color: t.green },
  'char':               { color: t.green },
  'builtin':            { color: t.sapphire },
  'inserted':           { color: t.green },
  'operator':           { color: t.sky },
  'entity':             { color: t.teal, cursor: 'help' },
  'url':                { color: t.teal },
  'variable':           { color: t.base },
  'atrule':             { color: t.mauve },
  'attr-value':         { color: t.green },
  'function':           { color: t.blue },
  'class-name':         { color: t.yellow },
  'keyword':            { color: t.mauve },
  'regex':              { color: t.pink },
  'important':          { color: t.red, fontWeight: 'bold' },
  'bold':               { fontWeight: 'bold' },
  'italic':             { fontStyle: 'italic' },
  // --- C++ specific
  'directive':          { color: t.pink },
  'directive-hash':     { color: t.pink },
  'macro':              { color: t.pink },
  'included':           { color: t.green },
  'namespace-std':      { color: t.sapphire },
  'punctuation.definition.tag': { color: t.red },
  // --- line highlight (used internally by Prism)
  ':not(pre) > code[class*="language-"]': {
    background: 'color-mix(in srgb, #cba6f7 12%, #181825)',
    borderRadius: '4px',
    padding: '0.15em 0.4em',
    whiteSpace: 'normal',
    fontSize: '0.83em',
  },
}

export default catppuccinMocha
