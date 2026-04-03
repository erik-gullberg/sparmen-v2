# AGENTS.md - AI Coding Agent Guidelines for Spärmen

## Project Overview
Spärmen is a Swedish song lyrics database (digital songbook) for a theater group. Built with Next.js 16, hosted on Vercel, using Supabase for database and Google OAuth authentication.

## Architecture

### Data Model (Supabase)
- `spex` → `show` → `song` hierarchy (spex = theater production, show = specific year's performance)
- `vote` table for user song favorites
- `role` table with `is_editor` flag for admin privileges
- `changelog` table tracks song edit history
- Custom RPC functions: `get_top_voted_songs`, `get_voted_songs`, `get_song_with_show_and_spex`

### Supabase Client Pattern (Critical)
Three different clients for different contexts:
```javascript
// Client components - src/utils/supabase/browserClient.js
import createClient from "@/utils/supabase/browserClient";
const supabase = createClient();

// Server components & actions - src/utils/supabase/server.js
import { createClient } from "@/utils/supabase/server";
const supabase = await createClient(); // Note: async!

// Build-time (generateStaticParams) - src/utils/supabase/buildClient.js
import { createBuildClient } from "@/utils/supabase/buildClient";
const client = createBuildClient();
```

### Route Groups
- `(main-flow)/` - Pages with SearchBar in layout (song, spex, search)
- `(create-new-entity)/` - Admin-only creation pages (newSpex, newShow, newSong)
- Root pages have no shared layout elements

### Server Actions
All data mutations use Server Actions in `src/app/actions/`:
- `spexActions.js` - CRUD for spex, shows, songs, voting
- `searchActions.js` - Search with autocomplete
- `randomSong.js` - Random song feature

Always call `revalidatePath()` after mutations to invalidate cache.

## Key Patterns

### Static Generation with ISR
Pages use aggressive caching with ISR:
```javascript
export const revalidate = 3600; // Revalidate every hour
export const dynamic = "force-static";
```

### Quick Song Navigation
SearchBar supports `{spexId}.{songNumber}` pattern (e.g., "3.5") for direct song access.

### Authentication & Authorization
- `AuthContext` provides `useAuth()` hook for client components
- `fetchUserAndRoles.js` checks `is_editor` role from `role` table
- Middleware protects `/profile` and `/edit` routes
- Admin features gated by `is_editor` boolean

### Component Conventions
- CSS Modules: `ComponentName.module.css` alongside `ComponentName.js`
- Client components marked with `"use client"` directive
- Toast notifications via `react-hot-toast`
- Rich text editing with TipTap (`@tiptap/react`)

## Development Commands
```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run analyze  # Bundle analysis (ANALYZE=true)
npm run lint     # ESLint
```

## Environment Variables
Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## File Structure Quick Reference
```
src/
├── app/
│   ├── actions/          # Server Actions for mutations
│   ├── (main-flow)/      # Routes with SearchBar
│   └── (create-new-entity)/ # Admin creation pages
├── components/           # Reusable UI components
├── context/AuthContext.js # Auth state provider
└── utils/supabase/       # Three different Supabase clients
```

## Swedish Language Notes
- UI is in Swedish ("Sök" = Search, "Spara" = Save, "Laddar" = Loading)
- "Spex" = theater production, "Show" = year's performance, "Sång" = song
- Error messages and toasts should be in Swedish

## Focus
- The app must prioritize performance and be able to handle many users simultaneously without degradation.
- The app must work especially well on mobile devices