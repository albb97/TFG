# AGUS frontend

React 18 + TypeScript + Vite + Tailwind CSS. See the [main README](../README.md) for the full project description.

```bash
cp .env.example .env
npm install
npm run dev      # development server
npm run build    # type-check + production build into dist/
```

- `src/services/api.ts`: all calls to the n8n webhooks (timeouts, adaptive response parsing, demo fallback)
- `src/hooks/`: conversation state, query optimizer, theme
- `src/components/`: Chat, Sidebar (device catalog), Admin, Feedback, Header
