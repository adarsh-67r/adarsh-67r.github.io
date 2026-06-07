<div align="center">

# adarsh-67r.github.io

*Personal portfolio & blog — built with React 19, Vite, and zero CSS frameworks.*

[![Live](https://img.shields.io/badge/live-adarsh--67r.github.io-3d9cbf?style=flat-square)](https://adarsh-67r.github.io)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?style=flat-square&logo=vite)](https://vitejs.dev)
[![Deploy](https://img.shields.io/badge/deploy-GitHub%20Actions-2088ff?style=flat-square&logo=githubactions)](https://github.com/adarsh-67r/adarsh-67r.github.io/actions)

</div>

---

## Features

- **Multi-theme system** — 20+ hand-crafted color themes, searchable with keyboard shortcut `T`
- **Music player** — ambient background music with a navbar pill (desktop) and circular FAB (mobile)
- **Blog** — markdown posts with syntax highlighting, reading time, and per-post SEO
- **Framer Motion** — page transitions, hero entrance, and scroll-based reveals
- **Cursor glow** — radial gradient spotlight that follows the mouse
- **Fully CSS-custom-property driven** — no Tailwind, no CSS-in-JS framework dependency

---

## Tech Stack

| Layer | Library / Tool |
|---|---|
| UI | React 19 + Vite 8 |
| Routing | React Router v7 |
| Animation | Framer Motion v12 |
| Icons | Phosphor Icons |
| Blog rendering | react-markdown + react-syntax-highlighter |
| SEO | react-helmet-async |
| Deploy | GitHub Actions → GitHub Pages |

---

## Local Development

```bash
git clone https://github.com/adarsh-67r/adarsh-67r.github.io.git
cd adarsh-67r.github.io
npm install
npm run dev        # starts at http://localhost:5173
```

---

## Project Structure

```
src/
├── components/
│   ├── Hero.jsx           # Landing section, typewriter roles
│   ├── About.jsx          # Bio, skills, social links
│   ├── Projects.jsx       # Project cards with tag filtering
│   ├── Navbar.jsx         # Glass navbar, theme picker, mobile menu
│   ├── MusicPlayer.jsx    # Pill player (desktop navbar)
│   ├── CursorGlow.jsx     # Mouse-following radial spotlight
│   ├── Footer.jsx
│   ├── TagBadge.jsx
│   ├── TechStack.jsx
│   └── TerminalCmd.jsx
├── context/
│   ├── ThemeContext.jsx    # Global theme state + CSS variable injection
│   └── MusicContext.jsx   # Audio engine (play/pause/seek/next/prev)
├── data/
│   ├── themes.js          # All theme definitions (bg, surface, text, accent, muted)
│   ├── projects.js        # Project entries
│   └── posts.js           # Post metadata (slug, title, date, tags)
├── content/
│   └── blog/              # Markdown (.md) post files
├── hooks/
│   └── useTyping.js       # Typewriter animation hook
└── pages/
    ├── Home.jsx
    ├── ProjectsPage.jsx
    ├── PostsPage.jsx
    ├── PostPage.jsx
    ├── ContactPage.jsx
    └── NotFound.jsx
```

---

## Customising Content

| File | What to edit |
|---|---|
| `src/components/Hero.jsx` | Name, intro text, `ROLES` array |
| `src/components/About.jsx` | Bio, social links, skills |
| `src/data/projects.js` | Project entries (title, description, tags, links) |
| `src/data/posts.js` | Post metadata (slug, title, date, tags) |
| `src/content/blog/*.md` | Actual blog post content (Markdown) |
| `src/data/themes.js` | Add / edit / remove themes |
| `src/context/MusicContext.jsx` | `PLAYLIST` array — add tracks to `public/music/` |

---

## Adding a Blog Post

1. Add an entry to `src/data/posts.js`:
   ```js
   { slug: 'my-post', title: 'My Post', date: '2026-06-07', tags: ['dev'] }
   ```
2. Create `src/content/blog/my-post.md` with your Markdown content.

---

## Adding a Theme

Add an object to the `themes` array in `src/data/themes.js`:

```js
{
  name:    'My Theme',
  value:   'my-theme',
  dark:    true,
  accent:  '#your-accent-hex',
  bg:      '#background-hex',
  surface: '#card-surface-hex',
  text:    '#primary-text-hex',
  muted:   '#secondary-text-hex',
}
```

---

## Deploy

Push to `main` — GitHub Actions builds and deploys automatically.

```bash
# Or deploy manually:
npm run deploy
```

---

<div align="center">
  <sub>Made with ♪ and too many themes</sub>
</div>
