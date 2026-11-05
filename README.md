# Majayong Frontend

React 18, TypeScript, and Vite application for the Majayong marketplace.

## Development

Requires Node.js 22 or later and pnpm 10.

```bash
pnpm install
cp .env.example .env
pnpm dev
```

This frontend snapshot is an M0 demo. It uses MSW mock responses by default and is not yet connected to the separate backend API. Setting `VITE_USE_MOCK=false` alone does not complete that integration.

## Checks

```bash
pnpm typecheck
pnpm test
pnpm build
```
