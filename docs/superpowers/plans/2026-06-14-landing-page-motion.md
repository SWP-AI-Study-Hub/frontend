# Landing Page Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add reliable balanced scroll reveals and noticeable hover micro-interactions to the DocuMind landing page.

**Architecture:** `Reveal` will use `IntersectionObserver` to add ready/revealed state classes once per element and expose a clamped delay through a CSS custom property. `LandingPage` will compose that primitive around hero and section content, while `index.css` owns transforms, stagger timing, hover feedback, idle motion, and reduced-motion overrides.

**Tech Stack:** Next.js 15, React 18, TypeScript, CSS, IntersectionObserver, Codex in-app browser.

---

### Task 1: Verify The Existing Reveal Failure

**Files:**
- Inspect: `src/components/ui/Reveal.tsx`
- Inspect: `src/index.css`

- [ ] **Step 1: Start the development server**

Run: `npm run dev -- -H 127.0.0.1 -p 3000`

Expected: Next.js serves the landing page at `http://127.0.0.1:3000`.

- [ ] **Step 2: Run the browser assertion before implementation**

Open the landing page, scroll to `#workflow`, and inspect the first `.reveal`.

Expected: FAIL because the element never receives `is-reveal-ready` or `is-revealed`; the current implementation relies only on CSS scroll timelines.

### Task 2: Implement Cross-Browser Reveal State

**Files:**
- Modify: `src/components/ui/Reveal.tsx`

- [ ] **Step 1: Add client-side observer behavior**

Implement a client component that:

```tsx
const delayMs = Math.min(Math.max(delay, 0), 360)
```

It adds `is-reveal-ready` after mounting, observes with `threshold: 0.12`, adds `is-revealed` on intersection, and disconnects after the first reveal. If `IntersectionObserver` is unavailable, it immediately reveals the content.

- [ ] **Step 2: Expose stagger timing**

Set the `--reveal-delay` CSS custom property from the clamped delay and preserve the optional `className`.

- [ ] **Step 3: Run lint**

Run: `npm run lint`

Expected: exit code 0.

### Task 3: Apply Reveal Composition And Stagger

**Files:**
- Modify: `src/components/landing/LandingPage.tsx`

- [ ] **Step 1: Wrap hero content**

Wrap hero copy and product preview in separate `Reveal` instances with a short stagger.

- [ ] **Step 2: Stagger repeated landing content**

Set delays of `index * 100` for workflow cards, `index * 80` for feature rows, and `index * 90` for FAQ items.

- [ ] **Step 3: Keep section groups focused**

Use short independent delays for security columns and leave the final CTA as one reveal group.

### Task 4: Add Balanced Motion Styling

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Replace scroll-timeline-only reveal CSS**

Use:

```css
.reveal.is-reveal-ready {
  opacity: 0;
  transform: translateY(24px);
}

.reveal.is-reveal-ready.is-revealed {
  opacity: 1;
  transform: translateY(0);
}
```

Transition opacity and transform with the approved easing and `--reveal-delay`.

- [ ] **Step 2: Strengthen hover feedback**

Workflow cards lift 6px with icon rotation/scale. Feature rows lift 4px with icon scale and 6px arrow movement. FAQ cards strengthen border/shadow and lift 3px.

- [ ] **Step 3: Add restrained hero preview motion**

Add a subtle 5px idle float after the product preview reveals, without animating layout properties.

- [ ] **Step 4: Complete reduced-motion coverage**

Disable reveal delay/transforms, idle float, and landing hover transforms under `prefers-reduced-motion: reduce`.

### Task 5: Browser And Build Verification

**Files:**
- Verify: `src/components/ui/Reveal.tsx`
- Verify: `src/components/landing/LandingPage.tsx`
- Verify: `src/index.css`

- [ ] **Step 1: Re-run the reveal assertion**

Expected: the target `.reveal` transitions from ready/not-revealed to `is-revealed` after scrolling into view.

- [ ] **Step 2: Verify interactions**

Hover workflow, feature, and FAQ items and compare computed transforms before/after. Open and close one FAQ and verify `aria-expanded`.

- [ ] **Step 3: Verify responsive rendering**

Check 1280x720 and 390x844 for clipping, overflow, blank content, framework overlays, and console errors.

- [ ] **Step 4: Run static verification**

Run: `npm run lint`

Expected: exit code 0.

Run: `npm run build`

Expected: exit code 0 and all routes generated.

- [ ] **Step 5: Commit and push**

Stage only the plan and animation implementation files, commit with `feat: add landing page motion`, and push `KhoaLD`.
