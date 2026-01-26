# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev       # Start dev server on http://localhost:5173
npm run build     # TypeScript compile + Vite production build
npm run lint      # ESLint check
npm run preview   # Preview production build locally
```

## Architecture Overview

HomeCraft is a furniture placement application that lets users upload room photos and overlay 2D furniture items. Built with React 19, TypeScript, and Supabase.

### Tech Stack
- **Frontend**: React 19, TypeScript, Vite 7
- **Styling**: Tailwind CSS 4 with CSS variables for theming (HSL color system)
- **State/Data**: TanStack Query for server state, React state for UI
- **Backend**: Supabase (auth, database, storage)
- **3D (unused in current flow)**: React Three Fiber + Drei

### Data Layer Pattern

The codebase follows a strict three-layer pattern for data access:

1. **Services** (`src/services/`) - Direct Supabase queries, one per domain
2. **Query Keys** (`src/lib/queryKeys.ts`) - Centralized cache key factory
3. **Hooks** (`src/hooks/`) - TanStack Query wrappers exposing `useQuery`/`useMutation`

Example flow:
```
useFurnitureList() → queryKeys.furniture.list() → furnitureService.getAllFurniture()
```

### Supabase Integration

- Client: `src/integrations/supabase/client.ts`
- Types: `src/integrations/supabase/types.ts` (auto-generated, do not edit)
- Database tables: `furniture`, `furniture_categories`, `partners`, `profiles`, `projects`
- SQL scripts for setup: `src/database/` (seed data, RLS policies, triggers)

Environment variables required:
```
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

### Routing & Auth

- Routes defined in `src/App.tsx`
- Protected routes wrap with `<ProtectedRoute>` component
- Auth state via `useAuth()` hook (listens to Supabase auth changes)
- Public: `/`, `/auth` | Protected: `/dashboard`, `/editor`, `/editor/:projectId`

### UI Components

- Base components in `src/components/ui/` use shadcn/ui patterns with Radix primitives
- Class Variance Authority (CVA) for variant styling
- `cn()` utility from `src/lib/utils.ts` for class merging

### Editor Module

The main feature is in `src/pages/Editor.tsx` and `src/components/editor/`:
- `PhotoScene.tsx` - Canvas with draggable 2D furniture overlays on uploaded image
- `FurnitureCatalog.tsx` - Sidebar listing furniture from database
- `PhotoEditorToolbar.tsx` - Controls for rotation, scale, delete, save
- Projects saved to Supabase with `furniture_placements` JSON field

### Supabase Edge Functions

Edge Functions are located in `supabase/functions/`:

- **delete-user**: Supprime complètement un utilisateur (projets, profil, et entrée auth.users)

Deployment commands:
```bash
# Install Supabase CLI if needed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the function
supabase functions deploy delete-user
```

The function requires these environment variables (auto-configured in Supabase):
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Language

The application UI is in French. Toast messages, labels, and user-facing text should remain in French.
