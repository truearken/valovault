# ValoVault - Agent Development Guide

## Build Commands

### Backend (Go)
- **Development**: `cd backend && air` (live reload) or `go run .`
- **Build**: `go build -o ./tmp/valovault-backend .`
- **No test framework currently configured**

### Frontend (Next.js + Tauri)
- **Development**: `cd frontend && npx tauri dev`
- **Build**: `cd frontend && npm run build`
- **Lint**: `cd frontend && npm run lint`
- **Type check**: `cd frontend && npx tsc --noEmit`

## Code Style Guidelines

### TypeScript/React (Frontend)
- **Imports**: Use absolute paths with `@/*` alias (e.g., `@/components/Header`)
- **Components**: Functional components with hooks, `"use client";` directive for client components
- **Types**: Strict TypeScript enabled, define interfaces in `src/lib/types.ts`
- **Styling**: Bootstrap classes + custom CSS variables for theming
- **Error handling**: Use ErrorModal component for user-facing errors

### Go (Backend)
- **Formatting**: Standard Go formatting (`go fmt`)
- **Package structure**: Organize by feature (handlers/, presets/, settings/, tick/)
- **Concurrency**: Use sync.RWMutex for thread-safe operations
- **Error handling**: Return errors from functions, handle in HTTP handlers

### General
- **Naming**: camelCase for JS/TS, PascalCase for Go exports
- **File organization**: Group related files, keep components in feature directories
- **No tests**: Currently no test framework
