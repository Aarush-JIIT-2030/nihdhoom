# WarriorHacks 2.0 — NIRDHOOM Submission Brief

Official event: https://warriorhacks-2-0.devpost.com/

## Track recommendation

**Recommended track: Hackathon**, provided the organizers confirm that the project's pre-existing development history is permitted.

WarriorHacks 2.0 requires the Hackathon track to submit code related to the theme, plus a GitHub repository, a 2–3 minute demo video, project pictures and a demo link for a website.

The theme is:

> **Create a project that solves an issue in your community, county, state, or nation.**

The four judging dimensions are:
- Impact
- Feasibility
- User Experience
- Technical Craft

## Eligibility caution

NIRDHOOM has substantial development history that predates the current WarriorHacks build period. The public event page confirms the theme timing and submission requirements, but this brief does **not** assume that pre-existing work is automatically eligible.

Before final submission, confirm with the organizers whether:
1. an existing project may be submitted;
2. the work must have started after the theme was revealed;
3. a newly built feature/module can be the submitted hackathon contribution.

**Do not misrepresent the project's development history.**

If pre-existing work is not eligible for the Hackathon track, use the Ideathon track only if the organizers permit NIRDHOOM's concept to be presented there.

## Community problem

During crop-residue season, farmers need a reliable way to coordinate non-burning residue management within a narrow operational window.

The problem is not solved by a map alone. A usable system needs to connect:
**field → request → machine → status → evidence → residue pathway.**

## Why NIRDHOOM fits

NIRDHOOM is a working web application prototype focused on that exact chain.

A farmer can:
- understand their field;
- request parali pickup/clearance;
- see status;
- access Telegram support;
- view proof and verification.

Operators can:
- receive work;
- capture GPS;
- attach evidence;
- work with an offline evidence queue.

The system also contains dispatch, residue pooling and verification foundations.

## 2–3 minute demo

### 0:00–0:25 — Community problem

"Farmers should not have to call five people to answer one question: who will handle my residue, and when?"

### 0:25–0:55 — Farmer

Open:
**My Fields → Book Parali Pickup**

Use the simplest farmer-facing workflow.

### 0:55–1:20 — Machine

Open:
**Track My Machine**

Show the operational state and dispatch path.

### 1:20–1:45 — Proof

Open:
**Check My Proof**

Show field evidence, GPS context and layered satellite support.

### 1:45–2:05 — Residue

Open:
**Parali Market**

Explain that verified residue can enter downstream pooling/offtake workflows; do not call a buyer listing a completed sale.

### 2:05–2:30 — Technical craft

Show:
- React/Vite frontend
- Supabase/Postgres/RLS
- server-authoritative booking
- Telegram webhook/linking
- GPS/evidence primitives
- offline evidence queue
- dispatch service integration
- responsive/mobile-first UI

## Devpost short description

> NIRDHOOM helps farmers coordinate crop-residue clearance through one field-first workflow: choose a field, request pickup, track the machine, capture proof and route verified residue toward downstream pathways. The prototype combines a mobile-first React interface, Supabase security/data boundaries, dispatch logic, GPS/evidence capture, Telegram support and layered verification.

## Impact statement

> NIRDHOOM targets a practical coordination bottleneck in a seasonal environmental problem. Rather than claiming that software alone eliminates crop burning, the prototype makes the non-burning workflow easier to request, schedule, observe and verify. A field pilot would measure booking completion, on-time arrival, evidence completeness, clearance time and residue handoff.

## Feasibility statement

> The architecture uses mature web technologies and separates browser workflows from privileged server/database operations. The product can run as a coordination layer over existing machinery. Remaining pilot dependencies — real machine availability, cadastral verification, provider-backed telemetry and commercial offtake — are explicitly identified rather than hidden behind demo data.

## User experience statement

> The farmer experience uses plain language such as "Book Parali Pickup", "Track My Machine" and "Check My Proof", larger touch targets, a five-step Field → Book → Machine → Proof → Parali journey, local-language support and Telegram connectivity. Advanced operations tools remain separate from the farmer flow.

## Technical craft statement

> NIRDHOOM uses React/Vite, Supabase/Postgres/PostGIS/RLS, server-side API routes, dispatch optimization foundations, browser GPS, evidence validation and hashing, IndexedDB offline evidence queuing, Telegram Bot API integration and layered verification. The repository includes automated audit/test/build checks.

## What not to claim in the submission

Never describe:
- demo records as live field coverage;
- an indicative quote as a guaranteed price;
- a UI state as proof of payment;
- satellite absence as proof of no burning;
- a buyer listing as a signed contract;
- illustrative carbon numbers as issued credits;
- a synthetic scenario as a measured field outcome.

## Required assets

- [ ] Public GitHub repository
- [ ] 2–3 minute demo video
- [ ] 5–8 screenshots/photos
- [ ] Live demo URL
- [ ] Track Selection Form completed
- [ ] README with setup instructions
- [ ] Short architecture diagram
- [ ] Clear project attribution and development history
