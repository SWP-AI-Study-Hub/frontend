# Landing Page Motion Design

## Goal

Add visible but restrained scroll and hover animations to the DocuMind landing page while preserving its academic, trustworthy visual style.

## Motion Direction

Use the approved "Balanced" direction:

- Reveal content from 24px below with opacity from 0 to 1.
- Use a smooth `cubic-bezier(0.16, 1, 0.3, 1)` easing curve.
- Stagger repeated cards and rows by 80-120ms.
- Lift interactive cards by 4-6px on hover.
- Strengthen border, shadow, icon, and arrow feedback without glow-heavy effects.
- Keep continuous motion limited to a subtle product-preview float.

## Architecture

Replace the CSS scroll-timeline-only reveal with a client-side `IntersectionObserver` implementation in `Reveal`. Elements start visible during server rendering and only enter the hidden pre-reveal state after JavaScript initializes, avoiding inaccessible or permanently hidden content.

Each `Reveal` accepts an optional delay value exposed as a CSS custom property. Landing page lists assign incremental delays based on item index. CSS owns all visual timing, transforms, and hover states.

## Component Behavior

### Scroll Reveal

- Observe each reveal wrapper once.
- Trigger when roughly 12% of the element enters the viewport.
- Stop observing after the first reveal.
- Apply `is-reveal-ready` after mounting and `is-revealed` after intersection.
- Use a maximum stagger delay of 360ms so long lists remain responsive.

### Hero

- Animate hero copy and product preview on initial entry.
- Give the preview a subtle idle float after its entry animation finishes.
- Preserve CTA responsiveness and avoid animating layout-affecting properties.

### Workflow Cards

- Reveal cards sequentially.
- On hover, lift 6px, strengthen the shadow, warm the border, and slightly rotate/scale the icon.

### Feature Rows

- Reveal rows sequentially.
- On hover, lift 4px, strengthen the border and shadow, move the arrow 6px, and slightly scale the icon.

### Security, FAQ, And Final CTA

- Reveal major columns and headings independently.
- Add a restrained hover response to FAQ cards.
- Keep existing accordion rotation and height animation.
- Reveal the final CTA as one focused group.

## Accessibility

- Under `prefers-reduced-motion: reduce`, disable reveal transforms, idle floating, stagger delays, and hover transforms.
- Content remains visible and usable if JavaScript is disabled or `IntersectionObserver` is unavailable.
- Motion must not affect keyboard focus order or introduce horizontal overflow.

## Testing

- Verify reveal state transitions in the browser before and after scrolling.
- Verify hover transforms on workflow, feature, and FAQ elements.
- Verify FAQ interaction still opens and closes correctly.
- Test at 1280x720 and 390x844.
- Check the browser console for errors and framework overlays.
- Run `npm run lint` and `npm run build`.

## Scope

No animation library, parallax, cursor-following effect, loading animation, or auth/dashboard animation is included.
