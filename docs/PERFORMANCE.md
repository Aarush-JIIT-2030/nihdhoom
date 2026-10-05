# NIRDHOOM Performance Notes

## Current strategy

NIRDHOOM is a Vite + React SPA with many optional operational and demonstration workspaces. The initial page should not pay the cost of every feature.

### Code loading

- React lazy loading + Suspense split secondary workspaces.
- Leaflet is loaded with the operations map instead of the application shell.
- Three.js remains isolated behind 3D workspaces.
- Navigation uses React transitions so a visible workspace stays responsive while another chunk resolves.
- Navigation menus and journey links prefetch their target chunk on pointer/focus intent.

### Images

- Below-the-fold images use native lazy loading and asynchronous decoding.
- The primary home hero is kept eager/high priority because it contributes to the first visual impression.
- Avoid adding large decorative images above the fold without a measurable reason.

### Rendering

- Mobile disables expensive backdrop blur.
- Reduced-motion users receive effectively static transitions.
- content-visibility auto is available through .perf-deferred for long below-the-fold sections.

## Performance rules

1. Do not statically import a library that is only needed by one advanced workspace.
2. Prefer native browser capabilities over adding a dependency for a small visual effect.
3. If a new dependency is large, explain why it cannot be implemented locally or loaded on demand.
4. Measure before adding animation.
5. Preserve readable loading states; code splitting should not create blank or flashing screens.

## Useful checks

npm run build
npm run syntaxcheck
npm test

For a production review, inspect built chunk sizes and test a throttled mobile connection. The goal is a fast farmer-first path with advanced capabilities available on demand.
