# Contributing to NIRDHOOM

Thanks for helping improve NIRDHOOM. The project is a field-first prototype, so correctness, evidence boundaries and farmer usability matter as much as visual polish.

## Before opening a change

1. Read `README.md` and the relevant files under `docs/`.
2. Keep live, demo, indicative and research-derived data clearly separated.
3. Never add service-role keys, provider secrets, OTP secrets or private farmer data to the browser bundle.
4. Prefer small, reversible changes over broad rewrites.

## Local checks

```bash
npm ci
npm run syntaxcheck
npm run audit
npm test
npm run build
```

The CI workflow runs these checks plus the Python dispatch-service tests.

## UI changes

- Design for a phone-sized farmer workflow first.
- Keep body text readable and touch targets at least 44px where practical.
- Use the NIRDHOOM field palette: cream, green and saffron/wheat accents.
- Respect `prefers-reduced-motion`.
- Lazy-load heavy workspaces and images that are below the fold.
- Do not introduce a second visual language for advanced features.

## Database/API changes

- Add or update a migration rather than editing production state manually.
- Review RLS, grants, RPC authorization and `SECURITY DEFINER` search paths.
- Validate server inputs and keep privileged credentials server-side.
- Add a regression test for every security or integrity fix.

## Pull requests

Explain **what changed**, **why**, **how it was tested**, and any **truth/release-boundary implications**. Screenshots or a short screen recording are welcome for UI changes.
