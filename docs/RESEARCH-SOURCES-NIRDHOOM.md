# NIRDHOOM research source map

This is the working research layer for NIRDHOOM. **Authoritative agriculture/government sources are the source of truth for agricultural claims.** Farmer/biomass platforms are studied for product patterns, not factual authority. Technical standards and official documentation guide implementation decisions.

## 1. Agriculture and policy — truth layer

### ICAR
- https://www.icar.gov.in/
- https://www.icar.gov.in/en/crop-residue-management-demonstration-day-held-nurpur-bet-punjab
- https://www.icar.gov.in/en/inter-state-travelling-seminar-paddy-straw-management-advancing-sustainable-farming-practices
- Use for paddy-straw management, machinery, agronomy, field conditions and crop-residue research.
- Current research note: ICAR's Punjab/Haryana work emphasizes science-based, farmer-centric and region-specific residue-management interventions.

### Ministry of Agriculture / PIB — Crop Residue Management
- https://www.pib.gov.in/
- https://www.pib.gov.in/PressReleasePage.aspx?PRID=1936626&lang=2&reg=48
- https://www.pib.gov.in/PressReleasePage.aspx?PRID=1942479&lang=2&reg=48
- Use for government policy, CRM guidelines, ex-situ supply-chain framing and machinery-support claims.
- The 2023 revised guidelines explicitly described techno-commercial paddy-straw supply-chain pilots linking farmers/aggregators/FPOs/panchayats with industries.

### CPCB / CAQM
- https://cpcb.nic.in/
- https://caqm.nic.in/
- Use for environmental context, crop-burning terminology, NCR pollution context and policy/enforcement claims.
- Product rule: do not equate absence of a satellite hotspot with proof of no burning.

### NASA FIRMS
- https://firms.modaps.eosdis.nasa.gov/
- https://firms.modaps.eosdis.nasa.gov/api/
- https://firms.modaps.eosdis.nasa.gov/api/area/
- Use for remote-sensing observations with sensor/product, timestamp, geometry and confidence.
- Current implementation note: FIRMS documents support VIIRS NOAA-20/NOAA-21 and other products; FIRMS currently states that Suomi-NPP delivery is scheduled to cease on 1 November 2026, so NIRDHOOM must not hard-code Suomi-NPP as the only source.
- Product rule: **No detection in this dataset = no detected hotspot in this dataset. It is not proof that burning did not occur.**

### ISRO Bhuvan
- https://bhuvan.nrsc.gov.in/
- https://bhuvan.nrsc.gov.in/wiki/index.php/How_to_use_WMS_services
- Use for Indian geospatial context and future agricultural GIS layers. Bhuvan documents OGC-compatible WMS/WMTS thematic services.
- Product rule: imported/reference geospatial layers must retain their source and date.

### DILRMP
- https://www.dilrmp.gov.in/
- https://www.dilrmp.gov.in/dilrmpold/
- Use for cadastral/land-record provenance.
- Product rule: farmer-declared, GPS-captured, manually drawn or imported geometry must not be labelled as authoritative cadastral land unless an authoritative source actually verifies it.

### IMD Agromet
- https://mausam.imd.gov.in/
- https://mausam.imd.gov.in/responsive/agromet_adv_ser_block_current_en.php
- Use for district/block agrometeorological advisories, crop-weather context and operational planning.
- Product rule: weather becomes a pickup/baling planning signal; it is not a machine-safety guarantee.

### AgriStack / Digital Agriculture Mission
- https://www.pib.gov.in/
- Use for federated farmer identity, geo-referenced village/crop registries and the principle that NIRDHOOM does not own authoritative government land/farmer records.

## 2. Market and farmer product references — pattern layer

### e-NAM
- https://www.enam.gov.in/web/
- https://logistics.enam.gov.in/web/
- Current reference: e-NAM explicitly states that Raw Biomass (Agri Residue) is available as a tradable commodity.
- Study quantity, quality, buyer/seller, location, bidding and transaction states.
- NIRDHOOM adaptation: residue listing should show crop, quantity, quality, moisture, location, pickup window, verification and commercial state.

### UPNEDA Bio Feedstock Portal / e-Parali
- https://upnedaeparali.in/
- Use for farmer/FPO-to-bioenergy-developer supply-chain patterns, direct market access and transparent deal workflows.
- Product rule: NIRDHOOM can borrow information architecture, not claim UPNEDA's commercial relationships.

### Kissaan Sampatti
- https://kissaansampatti.com/
- Study radius-based sourcing, crop-residue inventory, quantity/quality/location/price expectations and verified leads.
- Treat all business claims on the site as the platform's own claims, not agricultural truth.

### URJA-SETU
- https://www.urja-setu.in/
- https://www.urja-setu.in/sell-crop-residue
- Study role-based farmer/saathi/buyer/logistics workflows, bilingual onboarding, pickup calendar, lot identity and chain-of-custody information architecture.
- Do not copy its branding or treat its commercial estimates as NIRDHOOM truth.

### DeHaat
- https://dehaat.in/en
- Study farmer-first navigation, service aggregation, advisory and market-linkage patterns.

## 3. Logistics and engineering — implementation layer

### Google Routes
- https://developers.google.com/maps/documentation/routes/
- Use for route/distance/travel-time computation where a configured provider is available.

### Google OR-Tools VRPTW
- https://developers.google.com/optimization/routing/vrptw
- Dispatch proposal inputs: machine capacity, availability, field location, pickup duration, travel time, deadline, residue quantity and priority.
- Product rule: **optimization output is a proposal until a server-authorized booking transition confirms it.**

### Supabase RLS
- https://supabase.com/docs/guides/database/postgres/row-level-security
- Use database-level RLS and explicit allow/deny tests.
- Farmer A must not read Farmer B's field; operator access must be constrained to assigned/authorized work; buyers must be scoped to their demand/offer records.

### Telegram Bot API
- https://core.telegram.org/bots/api
- Use official webhook secret-token verification and familiar farmer notifications.
- Telegram should expose the next farmer action, not internal enterprise terminology.

### PWA / offline
- https://web.dev/learn/pwa/offline-data
- https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_APIs/Client-side_storage
- IndexedDB is the structured offline evidence queue; Cache Storage/service workers cover app resources.
- Product state machine: Saved locally → Waiting to sync → Uploading → Uploaded → Verified.

### WCAG 2.2
- https://www.w3.org/TR/wcag/
- Target practical 44×44px touch controls for field/mobile interactions even though WCAG 2.2's minimum target-size criterion is smaller in some cases.

## 4. NIRDHOOM domain model derived from the research

The product's mental model is:

Farmer
  ↓
Field
  ↓
Residue Lot
  ↓
Machine / Pickup
  ↓
Evidence
  ↓
Verification
  ↓
Pooling / Buyer
  ↓
Delivery / Impact

### Residue lot contract

A residue lot is a first-class object with:

- field_id
- farmer_id
- crop
- residue_type
- estimated_quantity
- verified_quantity
- moisture
- quality
- bale type
- harvest date
- ready_from
- pickup_deadline
- machine
- geometry/provenance
- verification source
- buyer
- custody history

### Provenance contract

Every consequential claim should expose its source/state:

- Field boundary → farmer declared / GPS / cadastral reference / verified source
- Crop → farmer declared / authoritative source
- Harvest → field record / evidence
- Fire observation → NASA FIRMS sensor + timestamp + confidence
- Machine capability → ICAR/PAU/manufacturer source + source date
- Weather → weather provider + fetched time
- Land record → authoritative government source or explicitly not verified
- Buyer demand → buyer/demand record
- Route → routing proposal / confirmed booking

### Farmer language contract

The primary farmer journey is intentionally small and bilingual at the navigation layer:

English / हिन्दी

- Home / घर
- My Fields / मेरे खेत
- Book Parali Pickup / पराली उठवाएँ
- Track My Machine / मशीन ट्रैक करें
- Parali Market / पराली बाज़ार

The architecture can expand to Punjabi and other pilot languages without changing the workflow IDs.

### Product language rules

Prefer:

- "Your baler is 18 minutes away"
- "Your straw has been verified"
- "Field boundary: farmer-declared"

Avoid exposing:

- "Agentic Dispatch Optimization"
- "Residue Pool Verification Gate"
- "Geospatial provenance confidence"

inside the primary farmer journey.

## 5. Source-of-truth boundary

NIRDHOOM's own authenticated Supabase records, evidence objects and server-authoritative workflow transitions remain the operational source of truth.

External sources inform, corroborate or provide context. They do not turn a demo value into a verified fact.

Research should be refreshed when agricultural policy, satellite product availability, land-record systems or pilot-region operating conditions change.
