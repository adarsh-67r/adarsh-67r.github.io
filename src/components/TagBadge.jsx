// Shared tag badge — colors adapt to theme via CSS var(--accent) fallback
// Fixed palette for well-known techs, theme-accent fallback for unknowns

const TAG_PALETTE = {
  // Languages
  JavaScript:  { text: '#f7df1e', border: 'rgba(247,223,30,0.35)',  bg: 'rgba(247,223,30,0.10)'  },
  TypeScript:  { text: '#5b9bd5', border: 'rgba(49,120,198,0.35)',   bg: 'rgba(49,120,198,0.10)'  },
  Python:      { text: '#6daadb', border: 'rgba(53,114,165,0.35)',   bg: 'rgba(53,114,165,0.10)'  },
  'C++':       { text: '#f34b7d', border: 'rgba(243,75,125,0.35)',   bg: 'rgba(243,75,125,0.10)'  },
  Rust:        { text: '#dea584', border: 'rgba(222,165,132,0.35)',  bg: 'rgba(222,165,132,0.10)' },
  Go:          { text: '#00add8', border: 'rgba(0,173,216,0.35)',    bg: 'rgba(0,173,216,0.10)'   },
  Shell:       { text: '#89e051', border: 'rgba(137,224,81,0.35)',   bg: 'rgba(137,224,81,0.10)'  },
  Bash:        { text: '#89e051', border: 'rgba(137,224,81,0.35)',   bg: 'rgba(137,224,81,0.10)'  },
  // Frameworks
  React:       { text: '#61dafb', border: 'rgba(97,218,251,0.35)',   bg: 'rgba(97,218,251,0.09)'  },
  Vite:        { text: '#bd34fe', border: 'rgba(189,52,254,0.35)',   bg: 'rgba(189,52,254,0.09)'  },
  Tailwind:    { text: '#06b6d4', border: 'rgba(6,182,212,0.35)',    bg: 'rgba(6,182,212,0.09)'   },
  'Next.js':   { text: '#e0e0e0', border: 'rgba(255,255,255,0.18)', bg: 'rgba(255,255,255,0.05)' },
  Astro:       { text: '#ff5d01', border: 'rgba(255,93,1,0.32)',     bg: 'rgba(255,93,1,0.09)'    },
  Svelte:      { text: '#ff3e00', border: 'rgba(255,62,0,0.32)',     bg: 'rgba(255,62,0,0.09)'    },
  Vue:         { text: '#42b883', border: 'rgba(66,184,131,0.35)',   bg: 'rgba(66,184,131,0.09)'  },
  'Node.js':   { text: '#68a063', border: 'rgba(104,160,99,0.32)',   bg: 'rgba(104,160,99,0.09)'  },
  Node:        { text: '#68a063', border: 'rgba(104,160,99,0.32)',   bg: 'rgba(104,160,99,0.09)'  },
  Docker:      { text: '#0db7ed', border: 'rgba(13,183,237,0.32)',   bg: 'rgba(13,183,237,0.09)'  },
  Linux:       { text: '#ffcc00', border: 'rgba(255,204,0,0.28)',    bg: 'rgba(255,204,0,0.08)'   },
  CSS:         { text: '#9b72cf', border: 'rgba(86,61,124,0.35)',    bg: 'rgba(86,61,124,0.10)'   },
  HTML:        { text: '#e34c26', border: 'rgba(227,76,38,0.32)',    bg: 'rgba(227,76,38,0.09)'   },
  Neovim:      { text: '#57a143', border: 'rgba(87,161,67,0.32)',    bg: 'rgba(87,161,67,0.09)'   },
}

export default function TagBadge({ tag }) {
  const c = TAG_PALETTE[tag]
  return (
    <span style={{
      padding: '3px 10px',
      // Falls back to theme accent when tag is not in palette
      background:   c ? c.bg     : 'color-mix(in srgb, var(--accent) 10%, transparent)',
      border: `1px solid ${c ? c.border : 'color-mix(in srgb, var(--accent) 28%, transparent)'}`,
      borderRadius: '999px',
      fontSize:     '0.7rem',
      color:        c ? c.text   : 'var(--accent)',
      fontFamily:   'var(--font-mono)',
      letterSpacing:'0.02em',
      whiteSpace:   'nowrap',
    }}>{tag}</span>
  )
}
