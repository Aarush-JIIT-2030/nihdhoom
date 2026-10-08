# NIRDHOOM research source map

This document records the external sources used to shape the residue-first product model. External sources are references for domain truth, UX patterns, and engineering constraints; they are not substitutes for NIRDHOOM's own live records.

## Domain and policy sources

- **ICAR / Indian Farming** — crop-residue machinery, including balers, straw rakes, seeders and residue-management practices. Use this for machine capability language and agronomic claims.
- **Ministry of Agriculture / PIB** — Crop Residue Management and ex-situ paddy-straw supply-chain policy. Use this for policy claims, supply-chain framing and programme context.
- **CPCB / CAQM** — air-quality and crop-burning context. Use this for environmental claims and enforcement context.
- **NASA FIRMS** — satellite fire observations. Treat detections as supporting observations with source, sensor, timestamp and confidence; absence of a detection is not proof of no burning.
- **ISRO Bhuvan** — Indian geospatial/thematic mapping reference. Use it to guide GIS layers and provenance-aware map design.
- **DILRMP** — land-record/cadastral modernization reference. Never label a farmer-declared or manually drawn polygon as an authoritative cadastral record without an authoritative source.
- **IMD Agromet Advisory Services** — agricultural weather/advisory reference. Operational weather should be translated into harvest/baling/pickup windows, not shown only as generic temperature.
- **e-NAM** — market/listing/quality workflow reference. Raw biomass (agri residue) is listed as a tradable commodity; use this as a reference for quantity, quality, demand and market states.
- **UPNEDA Bio Feedstock Portal / e-Parali** — direct farmer/FPO-to-bioenergy-developer supply-chain reference. Study the separation between the digital marketplace and actual commercial counterparties.

## Product and engineering references

- **DeHaat** — farmer-first service navigation and market-linkage patterns.
- **Google OR-Tools VRPTW** — dispatch model reference: travel time, vehicle capacity and time-window constraints.
- **Supabase RLS** — database authorization reference. Access boundaries must be enforced in Postgres, not merely hidden in React.
- **Telegram Bot API** — farmer communication and secure webhook integration reference.
- **Web platform offline storage** — IndexedDB/service-worker patterns for field evidence and reconnect queues.
- **WCAG 2.2** — touch targets, keyboard access and accessible status communication.

## NIRDHOOM implementation rules derived from the research

1. **Residue is a first-class operational object.** A field produces a residue lot; a machine moves it; evidence verifies it; a buyer consumes it.
2. **Every consequential claim has provenance.** Show source/state for field boundary, crop, quantity, verification and remote sensing.
3. **Evidence is chronological.** The product should expose a field → booking → machine → evidence → verification → market journey rather than disconnected dashboards.
4. **Dispatch is a proposal until confirmed.** Optimization output must never silently become a booking.
5. **Marketplace records are conditional until counterparties are real.** Seed/demo buyers remain visibly labelled.
6. **Remote sensing is supporting evidence.** FIRMS observations must not be represented as field-level proof by themselves.
7. **Cadastral truth stays external until verified.** A self-drawn boundary is not an authoritative land record.
8. **Weather becomes an operational signal.** Use it to explain pickup/baling risk and recommended windows.
9. **Farmer UI stays simple.** Enterprise terminology belongs in operations/verification workspaces, not the primary farmer journey.
10. **Offline is an explicit state machine.** Evidence should move through Saved locally → Waiting to sync → Uploading → Uploaded → Verified.

## Source-of-truth boundary

NIRDHOOM's own Supabase records, authenticated user actions, evidence objects and server-authoritative workflow transitions remain the product's operational source of truth. External sources inform or corroborate those records; they do not magically turn a demo value into a verified fact.
