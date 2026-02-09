# CLAUDE.md — Get Yo A$$ Outside

## Project Overview

**App Name:** Get Yo A$$ Outside  
**Type:** Mobile-first progressive web app  
**Purpose:** Encourage users to go outside through culturally resonant prompts inspired by African-American maternal figures.  
**Deadline:** February 15, 2025 @ 11:59pm (GitHub Challenge)

## Cultural Context

The phrase "Get yo a$$ outside" is something Black mothers, aunties, and grandmas say when their children have been on screens too long. It's firm but loving — not asking, *telling* — with care underneath. This app channels that energy: direct, no-BS, culturally authentic encouragement to touch grass, hug trees, and observe nature.

## Target User

**Jamal "Jay" Thompson** — 22-year-old CS student in Atlanta
- 6-8+ hours daily screen time
- Knows he should go outside more
- Responds to direct communication, not corporate wellness-speak
- Mobile-first, hates complicated UIs
- Values authenticity and cultural resonance

## Tech Stack

| Layer | Technology | Reason |
|-------|------------|--------|
| Build | Vite | Fast HMR, zero-config TS, optimized bundles |
| Markup | HTML5 | Semantic, accessible |
| Styling | Vanilla CSS | Full control, no framework bloat |
| Logic | TypeScript | Strict typing throughout, compiled by Vite |
| API | Overpass (OSM) | Free, no API key, good park data |
| Future API | Google Places | Migration path when ready |

## Architecture

```
get-yo-ass-outside/
├── index.html                 # Entry point (Vite requires root level)
├── src/
│   ├── main.ts                # App entry point
│   ├── css/
│   │   ├── variables.css      # Theme tokens
│   │   ├── main.css           # Base styles
│   │   └── components/        # Component styles
│   ├── modules/
│   │   ├── voice.ts           # "The Voice" prompts
│   │   ├── geolocation.ts     # Location handling
│   │   ├── parks.ts           # API integration
│   │   └── ui.ts              # DOM manipulation
│   ├── utils/
│   │   ├── distance.ts        # Haversine formula
│   │   └── storage.ts         # localStorage helpers
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces
│   └── assets/
│       └── icons/
├── .github/
│   ├── copilot-instructions.md
│   └── agents/
│       ├── planning-agent.md
│       ├── frontend-agent.md
│       ├── backend-agent.md
│       ├── code-review-agent.md
│       └── bug-fix-agent.md
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # Dependencies and scripts
├── CLAUDE.md                  # This file
└── README.md                  # Project documentation
```

## MVP Features (Priority Order)

1. **"The Voice"** — Randomized firm-but-loving prompts
2. **GEO Location** — Permission flow with fallback
3. **Parks Finder** — 3-5 nearby results via Overpass API
4. **Glassmorphic UI** — Mobile-first, dark/light modes
5. **Interaction Flow** — Open → Prompt → Location → Parks
6. **Accessibility** — WCAG 2.1 AA compliance
7. **GitHub Ready** — Clean README, proper structure

## Design Tokens

### Light Mode
```css
--color-primary: #2D5A27;      /* Deep forest green */
--color-secondary: #8B4513;    /* Warm wood brown */
--color-accent: #4A7C59;       /* Sage green */
--color-background: #F5F5DC;   /* Soft cream */
--color-surface: rgba(255, 255, 255, 0.6);
```

### Dark Mode
```css
--color-primary: #4A7C59;      /* Sage green */
--color-secondary: #D2691E;    /* Lighter wood */
--color-background: #0D1117;   /* Deep night */
--color-surface: rgba(30, 40, 50, 0.7);
/* + subtle starry night effect */
```

## Commands

```bash
# Install dependencies
npm install

# Development server (http://localhost:5173)
npm run dev

# Type checking (no emit, validation only)
npm run typecheck

# Production build (outputs to dist/)
npm run build

# Preview production build
npm run preview

# Linting (if configured)
npm run lint
```

## Git Workflow

- **Branching:** `feature/`, `fix/`, `refactor/`
- **Commits:** Conventional commits (`feat:`, `fix:`, `docs:`)
- **PRs:** All changes via pull request
- **Git operations:** Manual (Olu controls git)

## Quality Standards

### Code
- TypeScript strict mode enabled
- No `any` types without explicit justification
- No `var`, prefer `const`
- Functions small and single-purpose
- Comments where logic isn't obvious

### Accessibility
- Color contrast 4.5:1 minimum
- Touch targets 44px minimum
- Keyboard navigable
- Screen reader friendly

### Performance
- Vite handles code splitting and tree shaking
- Caching for API responses
- Loading states for async operations

### hosting
- Cloudflare prefered

## Future Roadmap

### Phase 2: User Profiles
- OAuth 2.0 + JWT authentication
- Home location tracking
- Visit history
- Streak tracking

### Phase 3: Enhanced Features
- Return-home acknowledgment notifications
- Personal stats dashboard
- Friend challenges

### Phase 4: Integrations
- Apple Health / Google Fit
- Weather-aware suggestions
- Calendar integration

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Build Tool | Vite | Fast dev, easy TS, optimized production |
| Framework | None (vanilla) | Deadline constraint, full control |
| CSS Framework | None | Glassmorphism needs custom work |
| API | Overpass | Free, no key, sufficient for MVP |
| State Management | localStorage | Simple, no backend needed |
| TypeScript | Strict throughout | Vite handles compilation seamlessly |

## Working With This Codebase

1. **Run `npm install` first** — Dependencies must be installed
2. **Use `npm run dev`** — Vite dev server with HMR
3. **Read the agents** — Each has specific responsibilities
4. **Check copilot-instructions.md** — Coding standards live there
5. **MVP first** — Every feature must serve the Feb 15 deadline
6. **Persona-driven** — Ask "Would Jay use this easily?"
7. **Manual git** — Never run git commands autonomously

## Vite-Specific Notes

- **Entry point:** `index.html` at project root, links to `src/main.ts`
- **Static assets:** Place in `public/` for direct copying, or `src/assets/` for processing
- **CSS imports:** Import CSS directly in TypeScript files
- **Environment variables:** Use `import.meta.env` (prefix with `VITE_` for exposure)
- **Path aliases:** Configured as `@/` → `src/` in `vite.config.ts` and `tsconfig.json`

---

*"Get yo a$$ outside!" — Grandma, 2025*
