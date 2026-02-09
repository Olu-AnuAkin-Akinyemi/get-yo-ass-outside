# Copilot Instructions: Get Yo A$$ Outside

## Project Overview

**App Name:** Get Yo A$$ Outside  
**Deadline:** February 15, 2025 @ 11:59pm  
**Purpose:** Encourage users to go outside through culturally resonant prompts inspired by African-American maternal figures (mothers, aunties, grandmas).

## Target User

**Jamal "Jay" Thompson** — 22-year-old college student in Atlanta. Tech-savvy but screen-addicted. Responds to direct, no-BS communication. Mobile-first. Values authenticity over corporate wellness-speak.

## Tech Stack

- **Build Tool:** Vite (fast HMR, native TS support)
- **TypeScript:** Strict mode enabled, used throughout
- **CSS:** Vanilla CSS with custom properties (no frameworks)
- **HTML:** Semantic, accessible markup
- **API:** Overpass API (OpenStreetMap) for park data — migration path to Google Places

## Vite Configuration

- **Entry point:** `index.html` at project root
- **Source directory:** `src/`
- **Output directory:** `dist/`
- **Path alias:** `@/` maps to `src/`
- **Dev server:** `http://localhost:5173`

## Coding Standards

### TypeScript
- Strict mode is enabled — no implicit any
- Use explicit type annotations for function parameters and returns
- Define interfaces in `src/types/index.ts`
- Use `const` over `let`, never use `var`
- Prefer type inference for simple assignments
- No `any` types without explicit `// @ts-expect-error` comment and justification

```typescript
// ✅ Good
const getParks = async (coords: Coordinates): Promise<Park[]> => {
  // ...
};

// ❌ Bad
const getParks = async (coords) => {
  // ...
};
```

### CSS
- Mobile-first responsive design
- CSS custom properties for theming (light/dark modes)
- BEM-style naming: `.block__element--modifier`
- Glassmorphism via `backdrop-filter: blur()`
- Minimum touch target: 44px
- Contrast ratio: 4.5:1 minimum
- Import CSS in TypeScript: `import '@/css/main.css'`

### HTML
- Semantic elements (`<main>`, `<section>`, `<article>`, `<nav>`)
- ARIA labels where needed
- No div soup
- `index.html` at root level (Vite requirement)

### File Organization
```
get-yo-ass-outside/
├── index.html                 # Entry point (root level)
├── src/
│   ├── main.ts                # App entry, imports CSS
│   ├── css/
│   │   ├── variables.css      # Theme tokens
│   │   ├── main.css           # Base styles, imports variables
│   │   └── components/        # Component-specific styles
│   ├── modules/
│   │   ├── voice.ts           # "The Voice" prompts
│   │   ├── geolocation.ts     # Location handling
│   │   ├── parks.ts           # API calls + park data
│   │   └── ui.ts              # DOM updates
│   ├── utils/
│   │   ├── distance.ts        # Haversine formula
│   │   └── storage.ts         # localStorage helpers
│   ├── types/
│   │   └── index.ts           # All TypeScript interfaces
│   └── assets/
│       └── icons/
├── public/                    # Static assets (copied as-is)
├── vite.config.ts
├── tsconfig.json
└── package.json
```

### Import Conventions
```typescript
// Use path alias for src imports
import { Park } from '@/types';
import { calculateDistance } from '@/utils/distance';
import { getRandomPrompt } from '@/modules/voice';

// CSS imports in main.ts
import '@/css/main.css';
```

## MVP Features (Priority Order)

1. **"The Voice"** — Firm but caring outdoor prompts (randomized)
2. **GEO Location Access** — Permission flow with clear value prop
3. **Nearby Parks Finder** — 3-5 results via Overpass API
4. **Glassmorphic UI** — Mobile-first, dark/light modes
5. **Basic Interaction Flow** — Open → Prompt → Location → Parks → Action
6. **Accessibility** — WCAG 2.1 AA compliance
7. **GitHub Submission Ready** — Clean README, proper structure

## Voice & Tone (For Content Generation)

When generating prompt text or UI copy, channel the energy of:
- A Black grandmother who loves you but doesn't play
- Firm, not mean. Direct, not harsh.
- Humor is welcome, but respect is baseline

**Example prompts:**
- "You've been inside all day. That's enough. Get up."
- "Phone down. Grass up. Let's go."
- "Fresh air won't kill you, but that screen time might."

## Git Workflow

- **Agents do NOT run git commands** — Olu handles all git operations
- Agents may suggest commit messages
- Branch naming: `feature/`, `fix/`, `refactor/`
- Commit style: conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`)

## Quality Gates

Before considering any feature complete:
- [ ] `npm run typecheck` passes with no errors
- [ ] `npm run build` succeeds
- [ ] Works on mobile (iOS Safari, Android Chrome)
- [ ] Works on desktop (Chrome, Firefox, Safari)
- [ ] Passes accessibility check (contrast, labels, keyboard nav)
- [ ] No console errors
- [ ] Code is commented where logic isn't obvious

## Environment Variables

If needed, prefix with `VITE_` for client exposure:
```bash
VITE_API_KEY=xxx  # Accessible via import.meta.env.VITE_API_KEY
```

Do NOT commit API keys. Use `.env.local` (gitignored).
