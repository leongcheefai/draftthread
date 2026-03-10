# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Drafthread is an AI-powered thread builder for X (Twitter) and Threads. It generates optimized multi-post content with platform-specific formatting (280 char limit for X, 500 for Threads).

## Commands

```bash
pnpm dev          # Start dev server (localhost:3000)
pnpm build        # Production build
pnpm lint         # ESLint
```

## Tech Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript** (strict mode)
- **Tailwind CSS v4** with `@tailwindcss/postcss` plugin
- **shadcn/ui** (new-york style, neutral base color) on Radix UI primitives
- **React Hook Form** + **Zod** for form handling/validation
- **next-themes** for dark mode (dark by default)
- Path alias: `@/*` maps to project root

## Architecture

**Single-page client-side app.** The main page (`app/page.tsx`) is a `"use client"` component that manages all state with `useState` — no global state library, no backend API integration yet (uses mock data).

### Key directories:
- `components/drafthread/` — Domain components: `header`, `input-form`, `thread-preview`
- `components/ui/` — shadcn/ui primitives (do not edit manually; managed by shadcn CLI)
- `lib/drafthread-types.ts` — Core domain types (`Platform`, `ThreadType`, `Tone`, `Tweet`, `ThreadData`, `FormData`)
- `hooks/` — Custom hooks (`use-mobile`, `use-toast`)

### Data flow:
Page component holds form state (`FormData`) and thread state (`ThreadData`). `InputForm` receives state + callbacks. `ThreadPreview` renders platform-specific previews with inline editing and copy features.

### Layout:
- Desktop: fixed-width form panel (480px) + flexible preview panel
- Mobile: tab-based switching between "Write" and "Preview"

## Styling Conventions

- Dark theme default (`bg-zinc-950`), OKLch color space for design tokens
- CSS variables defined in `app/globals.css` using Tailwind v4 `@theme inline`
- Use `cn()` from `lib/utils.ts` to merge Tailwind classes
