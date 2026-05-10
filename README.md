# adarsh-67r.github.io

Personal portfolio and blog.

**Live:** [adarsh-67r.github.io](https://adarsh-67r.github.io)

## Stack

- React 18 + Vite
- Framer Motion
- Lucide Icons
- react-markdown + react-syntax-highlighter
- react-helmet-async
- CSS custom properties (no Tailwind)

## Dev

```bash
npm install
npm run dev
```

## Customise

| File | What to edit |
|---|---|
| `src/components/Hero.jsx` | Name, intro text, roles |
| `src/components/About.jsx` | Bio, social links |
| `src/data/projects.js` | Projects list |
| `src/data/posts.js` | Post metadata |
| `src/content/blog/` | Markdown post files |
| `src/data/themes.js` | Add / remove themes |

## Deploy

Push to `main` — GitHub Actions builds and deploys automatically.

```bash
# or manually:
npm run deploy
```
