# Project Memory: Get Yo A$$ Outside

**Last Updated:** February 9, 2026  
**Status:** Phase 0 Complete, Ready for Phase 1  

---

## What We've Built

### Phase 0: Foundation & UI Shell ✅
**Completed:** February 9, 2026

#### Features Implemented
1. **"The Voice" Module** ([src/modules/voice.ts](src/modules/voice.ts))
   - 15 culturally authentic prompts
   - Random prompt selection
   - Firm but caring tone (inspired by Black mothers, aunties, grandmas)

2. **UI Module with View-Based Rendering** ([src/modules/ui.ts](src/modules/ui.ts))
   - `renderPromptView()` - Initial app view
   - `renderResultsView()` - Parks results (placeholder)
   - Event handling per view
   - Loading state management
   - HTML escaping for XSS prevention

3. **Component Styles** ([src/css/components/](src/css/components/))
   - Glassmorphic prompt card
   - Primary/secondary button styles
   - Responsive layout (mobile-first)
   - Full accessibility support with reduced motion

4. **PWA Architecture** ([index.html](index.html))
   - Minimal shell (just `#app` container)
   - Views rendered dynamically via `innerHTML`
   - Prepared for app-like navigation

---

## Core Mistakes & Lessons Learned

### ❌ Mistake 1: Misunderstanding PWA Architecture
**Problem:** Initially tried to put all HTML in index.html like a traditional website.  
**Fix:** Use minimal shell in HTML, render views with `innerHTML` for state changes.  
**Rule:** PWAs switch between views - use `innerHTML` for view rendering, `textContent` for text updates within a view.

### ❌ Mistake 2: Not Escaping innerHTML Content
**Problem:** Using template literals in `innerHTML` without escaping can cause XSS.  
**Fix:** Created `escapeHtml()` utility function using `textContent` + `innerHTML` trick.  
**Rule:** Always escape dynamic content when using `innerHTML`, even if from "trusted" sources.

### ❌ Mistake 3: Hardcoded Transitions (Accessibility Issue)
**Problem:** Used `transition: all 0.2s ease` which ignores `prefers-reduced-motion` preference.  
**Fix:** Use transition variables (`var(--transition-base)`) and add `@media (prefers-reduced-motion: reduce)`.  
**Rule:** Always respect user motion preferences. Use CSS variables for transitions.

### ❌ Mistake 4: Console Logs in Production Code
**Problem:** Debug console.logs would ship to production bundle.  
**Fix:** Use `const DEBUG = import.meta.env.DEV` and conditionally log.  
**Rule:** Always gate debug logs behind a development-only flag.

### ❌ Mistake 5: Not Re-attaching Event Listeners After View Changes
**Problem:** When using `innerHTML` to switch views, event listeners are destroyed.  
**Fix:** Each view has its own `attach*Listeners()` function called after rendering.  
**Rule:** After `innerHTML` view change, always re-attach event listeners for that view.

---

## Architecture Decisions

### View-Based Rendering Pattern

**When to use `innerHTML`:**
- Switching between app views/screens (prompt → results → error)
- Rendering lists of items (park cards)
- Creating complex component structures

**When to use `textContent`:**
- Updating button labels within current view
- Changing single text values
- Any text-only update

**What goes in `index.html`:**
- `#app` container (minimal shell)
- PWA metadata (manifest, theme-color)
- Script tag for Vite entry point

**View Structure:**
```typescript
// Each view is a separate function
const renderViewName = () => {
  app.innerHTML = `<main>...</main>`;
  attachViewNameListeners();
};
```

---

## Coding Standards Established

### TypeScript
- ✅ Strict mode enabled, no `any` types
- ✅ Explicit type annotations on all function parameters/returns
- ✅ Use `const` over `let`, never `var`
- ✅ Optional chaining for DOM queries (`btnText?.textContent`)
- ✅ Debug flag: `const DEBUG = import.meta.env.DEV`
- ✅ Escape HTML when using innerHTML: `escapeHtml(text)`

### HTML
- ✅ Minimal shell in index.html (PWA pattern)
- ✅ Semantic elements (`<main>`, `<section>`, `<button>`)
- ✅ ARIA attributes (`role="status"`, `aria-live="polite"`)
- ✅ Views rendered in TypeScript with proper escaping

### CSS
- ✅ Mobile-first responsive design
- ✅ BEM naming: `.block__element--modifier`
- ✅ Use CSS variables, not hardcoded values
- ✅ Always include `@media (prefers-reduced-motion: reduce)`
- ✅ Transitions via variables: `var(--transition-base)`
- ✅ Component styles in separate files

### Security
- ✅ Escape HTML when using `innerHTML`: `escapeHtml(text)`
- ✅ Use `textContent` for text-only updates
- ✅ No eval(), no unsanitized template literals
- ✅ Trust only hardcoded/validated data sources

---

## Tech Stack Decisions

| Choice | Reason |
|--------|--------|
| Vite | Fast HMR, zero-config TS, production optimization |
| Vanilla TS | Deadline-driven, full control, no framework overhead |
| CSS Variables | Theme support (light/dark), global consistency |
| View-based rendering | PWA pattern, app-like navigation |
| No SPA framework | MVP deadline, single-page sufficient |

---

## Quality Gates Passed

- [x] `npm run typecheck` — No errors
- [x] Accessibility — ARIA labels, focus states, reduced motion
- [x] Mobile-first — Works at 375px viewport
- [x] Touch targets — 48px minimum
- [x] Semantic HTML — Proper element usage
- [x] XSS prevention — HTML escaping for innerHTML
- [x] Debug logging — Gated behind DEV flag
- [x] PWA architecture — View-based rendering ready

---

## Next Steps

### Phase 1: Geolocation (Not Started)
- Request user location permission
- Handle permission denial gracefully
- Fallback to manual location entry
- Store last known location in localStorage
- Create geolocation module

### Phase 2: Parks API Integration (Not Started)
- Connect to Overpass API (OpenStreetMap)
- Search for parks within radius
- Calculate distances (Haversine formula)
- Create parks module
- Create distance utility

### Phase 3: Results View (Not Started)
- Implement `renderResultsView()` fully
- Render park cards with glassmorphism
- Show distance, name, type
- Add "Get Directions" links (external)
- Loading states during API calls
- Error handling view

### Phase 4: Polish & Deploy (Not Started)
- Add PWA manifest.json
- Accessibility audit
- Performance optimization
- Build for production
- Deploy to Cloudflare Pages

---

## File Structure Reference

```
get-yo-ass-outside/
├── index.html                      # ✅ Minimal PWA shell
├── src/
│   ├── main.ts                     # ✅ Entry point
│   ├── modules/
│   │   ├── voice.ts                # ✅ Prompt generation
│   │   ├── ui.ts                   # ✅ View rendering
│   │   ├── geolocation.ts          # ⏳ Phase 1
│   │   └── parks.ts                # ⏳ Phase 2
│   ├── css/
│   │   ├── variables.css           # ✅ Design tokens
│   │   ├── main.css                # ✅ Base styles
│   │   └── components/             # ✅ Component styles
│   │       ├── layout.css
│   │       ├── prompt-card.css
│   │       └── buttons.css
│   ├── types/
│   │   └── index.ts                # ✅ Type definitions
│   └── utils/                      
│       └── distance.ts             # ⏳ Phase 2
├── public/
│   └── manifest.json               # ⏳ Phase 4
├── .github/
│   └── copilot-instructions.md     # ✅ Coding standards
├── memory.md                       # ✅ This file
├── CLAUDE.md                       # ✅ Project overview
├── vite.config.ts                  # ✅ Build config
├── tsconfig.json                   # ✅ TS config
└── package.json                    # ✅ Dependencies
```

**Legend:**  
✅ Complete | ⏳ Planned | ❌ Not Started

---

## Important Reminders

1. **Never run git commands** — Olu handles all git operations
2. **MVP before polish** — Every feature must serve Feb 15 deadline
3. **Mobile-first** — Test at 375px viewport first
4. **Accessibility is not optional** — WCAG 2.1 AA compliance required
5. **Persona-driven decisions** — Ask "Would Jay use this easily?"
6. **View-based architecture** — innerHTML for views, textContent for text updates
7. **Always escape HTML** — Use `escapeHtml()` when rendering dynamic content

---

## Known Issues / Tech Debt

None currently. Phase 0 complete with proper PWA architecture.

---

## Success Metrics

- [x] App loads without errors
- [x] Prompt displays correctly
- [x] Button is clickable and accessible  
- [x] View-based rendering works
- [ ] Geolocation works on mobile
- [ ] Parks API returns results
- [ ] View transitions smooth
- [ ] Build completes successfully
- [ ] Deployed to Cloudflare Pages
