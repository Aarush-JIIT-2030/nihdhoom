# NIRDHOOM (ਨਿਰਧੂਮ) — The Parali Reframe

> **"We don't buy straw and we don't buy balers. We run a dispatch network over Punjab's idle, already-subsidised crop residue machinery. We sell farmers a guaranteed clearance date backed by a penalty, price it dynamically by how early they book, settle per acre in under 90 seconds over UPI, and prove non-burning against satellite fire data so the record can be sold to carbon registries, CBG plants, and the state."**

![Nirdhoom Punjab Farmer Hero](/public/images/punjab_farmer_hero.jpg)

[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-3D%20Digital%20Twin-black?logo=three.js)](https://threejs.org/)
[![NASA FIRMS](https://img.shields.io/badge/NASA%20FIRMS-VIIRS%20375m-red?logo=nasa)](https://firms.modaps.eosdis.nasa.gov/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📌 The Executive Reframe

Traditional stubble aggregators buy balers (₹15–20 lakh each), store thousands of tonnes of bulky straw, and collapse from working capital starvation. Meanwhile, Punjab and Haryana already house **1.25 lakh operational CRM machines** (out of 1.65 lakh distributed since 2018) bought with **50% to 80% CRM government subsidy**, parked in Custom Hiring Centres (CHCs) and FPOs.

**Nirdhoom owns zero balers.** We unlock stranded public infrastructure with an autonomous dispatch and verification layer.

### The Punjab Crisis in Numbers (2024-2025 Real Data)

| Metric | Value | Source |
|--------|-------|--------|
| **Paddy straw generated per season** | 18.81 million tonnes | Punjab Agriculture Dept |
| **Farm fire incidents (2025)** | 5,114 (down 93% from 76,929 in 2020) | CAQM / NASA FIRMS |
| **CRM machines operational** | ~1.25 lakh (50-80% subsidised) | CAQM Action Plan 2026-27 |
| **CRM subsidy allocated (2026-27)** | ₹576 Crore | Central & State Govt |
| **Harvest-to-sowing window** | 15 days (non-negotiable) | Agronomic constraint |
| **Environmental Compensation (>5 ac)** | ₹30,000 + Red Entry in land records | CAQM 2026 Rules |

### The 5 Strategic Wedges

| # | Wedge | The Conventional Flaw | The Nirdhoom Reframe |
|---|-------|------------------------|----------------------|
| **1** | **Asset Strategy** | Buy balers & storage yards (high capex) | **Route Punjab's idle CRM-subsidised machinery fleet (₹0 capex)** |
| **2** | **Product & Trust** | Offer variable biomass pricing | **Sell a guaranteed clearance date backed by a ₹4,500 UPI default penalty** |
| **3** | **Pricing Mechanism** | Pay by weight (farmgate disputes) | **Pay per acre; yield-manage the window (early booking bonus vs late floor)** |
| **4** | **Data Moat** | React after harvest panic begins | **Forecast harvest curve via Sentinel-2 NDVI time series & variety mix** |
| **5** | **Offtake Quality** | Dump straw exclusively into low-margin CBG | **Quality-based auction: mushroom substrate (+₹1,350/T), fibre, biochar & fodder** |

---

## 🛰️ 4-Beat Hackathon Pitch Narrative

```mermaid
sequenceDiagram
    autonumber
    actor Farmer as Gurpreet Singh (Ubhawal)
    participant WhatsApp as WhatsApp / IVR Bot
    participant VRP as OR-Tools Dispatch Engine
    participant Baler as CHC Baler #14
    participant Satellite as NASA FIRMS VIIRS 375m
    participant Bank as RazorpayX UPI Ledger

    Farmer->>WhatsApp: Sends "Book pickup for Khasra 412/1-2" (18 days early)
    WhatsApp-->>Farmer: Confirmed slot locked @ ₹1,450/ac backed by penalty
    VRP->>Baler: Dispatches nearest idle CHC baler under 48h constraint
    Baler->>Farmer: Completes field baling; scans QR Lot
    Baler->>Bank: Triggers digital clearance
    Bank-->>Farmer: Instant ₹5,075 credited to UPI in <90 seconds
    Satellite->>Satellite: Nightly ST_Contains spatial audit: 0 fires in polygon!
    Satellite-->>Bank: Generates auditable non-burn carbon certificate
```

---

## 📸 Real Ground Truth Data & Verification

- **Ground Reality Pilot**: Ubhawal & Bhawanigarh cluster, Sangrur District, Punjab.
- **Punjab Fire Statistics**: 5,114 incidents in 2025 (down 53% from 10,909 in 2024, 93% from 2020). Source: CAQM.
- **Pollution Attribution**: Defensible framing backed by **IITM Decision Support System (DSS)** and peer-reviewed WRF-Chem atmospheric modeling (10 Oct to 20 Nov 40-day window).
- **Satellite Audit Sensor**: NASA FIRMS NOAA-20 & Suomi-NPP VIIRS 375m resolution sensor.
- **Multi-Layer Verification**: FIRMS thermal + Sentinel-2 NDVI burn-scar analysis + polygon clearance receipts.
- **Circular Economy Offtakes**: CBG (₹1,850/T) → Mushroom Substrate (₹3,850/T) → Biochar (₹2,650/T) → Cattle Fodder (₹2,400/T).
- **Instant Settlement**: UPI payouts settled in `<90 seconds` against field polygons.

---

## 🌾 Key Features

### 12 Interactive Operational Surfaces

| Surface | Description | Key Tech |
|---------|-------------|----------|
| **🏠 Overview & Landing** | Hero showcase with real Punjab imagery, impact stats, farmer testimonials | Spotlight, Marquee, AnimatedBeam |
| **🤖 Agentic Swarm Console** | 5-agent autonomous coordination with holographic neural core | Multi-agent orchestration |
| **🎬 4-Beat Demo Runner** | Step-by-step pitch: WhatsApp → Dispatch → UPI → Satellite | Live KPI dashboard |
| **🌐 3D Digital Twin** | Three.js Punjab Malwa hotspot with orbiting NOAA-20 satellite | Three.js WebGL |
| **🚜 3D Baler Model** | Interactive CAD twin with rotating pickup reel & moisture probe | Three.js components |
| **🗺️ Ops Console** | Live GIS map with OR-Tools VRP dispatch | Leaflet, GeoJSON |
| **💬 WhatsApp Bot** | Bilingual Punjabi/Hindi farmer interface with IVR flow | Voice synthesis |
| **📱 Field Operator PWA** | Offline-first baler app with IndexedDB sync | Progressive Web App |
| **🛰️ Satellite Audit** | NASA FIRMS 0-burn verification layer | Spatial analysis |
| **🌾 Offtake Auction** | Multi-buyer quality-based straw auction | Dynamic pricing |
| **🌿 Carbon Marketplace** | Institutional carbon credit issuance (Verra VM0042) | Blockchain-ready |
| **📍 Farmer Onboarding** | KYC flow: OTP → Aadhaar → Selfie → UPI → Land records | Digital identity |
| **🛡️ Judge Defense** | 7 critical Q&A defenses with live unit economics | Interactive slider |

### Real-World Data Integration

- **🔥 Punjab Fire Statistics (2020-2025)**: Real CAQM data showing 93% decline with honest caveat about burnt area
- **🌾 District-Level Hotspot Data**: Sangrur, Patiala, Mansa, Barnala fire incidents & CRM machinery counts
- **👨‍🌾 Farmer Testimonials**: Authentic voices from Sangrur pilot in Punjabi (Gurmukhi script)
- **♻️ Circular Economy Pathways**: CBG, mushroom substrate, biochar, cattle fodder with real buyer names
- **📊 Unit Economics Simulator**: Interactive slider comparing asset-heavy vs Nirdhoom model at any scale

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript 6.0, Vite 8.3 |
| **Styling** | TailwindCSS + Custom design system (glassmorphism, particle effects) |
| **Typography** | Outfit, Plus Jakarta Sans, JetBrains Mono, Space Grotesk |
| **3D Engine** | Three.js (satellite orbit, baler CAD model, terrain) |
| **Maps & GIS** | Leaflet, GeoJSON, NASA FIRMS thermal overlays |
| **Algorithms** | OR-Tools VRP simulation, PostGIS `ST_Contains` spatial audit |
| **Animations** | Spotlight, Marquee, AnimatedBeam, ParticleField, CardTilt3D |
| **Farmer UX** | WhatsApp Cloud API simulator, Punjabi audio synthesis, IVR bot |
| **Carbon Layer** | Verra VM0042, Gold Standard marketplace simulation |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/nirdhoom.git

# Navigate to project directory
cd nirdhoom

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build
```bash
npm run build
npm run preview
```

---

## 🏛️ Project Structure

```
nirdhoom/
├── public/
│   └── images/                   # High-res authentic ground photos & satellite visuals
│       ├── punjab_farmer_hero.jpg    # Hero farmer in golden paddy field
│       ├── farmer_gurpreet.jpg       # Farmer avatar: Gurpreet Singh Brar
│       ├── farmer_manpreet.jpg       # Farmer avatar: Manpreet Kaur Sandhu
│       ├── baling_fleet.jpg          # CHC baler fleet in Sangrur fields
│       ├── satellite_firms.jpg       # NASA FIRMS thermal observation
│       ├── offtake_facility.jpg      # CBG & mushroom substrate facility
│       ├── parali_burning.jpg        # Stubble burning problem visual
│       └── punjab_farm_hero.jpg      # Aerial golden harvest view
├── src/
│   ├── components/
│   │   ├── Landing/              # Hero, ImpactStats, Marquee & Visual Telemetry
│   │   ├── AgenticConsole/       # 5-Agent Multi-Agent Holographic Swarm
│   │   ├── OpsConsole/           # Real-time GIS Map & OR-Tools VRP Dispatch
│   │   ├── FarmerSurface/        # Punjabi WhatsApp & IVR Bot with Audio Synth
│   │   ├── FieldOperator/        # Offline PWA & <90s UPI Settlement
│   │   ├── VerificationLayer/    # NASA FIRMS ST_Contains Audit & Carbon Certificates
│   │   ├── OfftakeAndForecast/   # Multi-Offtake Auction & Sentinel-2 NDVI Forecast
│   │   ├── CarbonMarketplace/    # Carbon Credit Marketplace (Verra, Gold Standard)
│   │   ├── FarmerOnboarding/     # Digital KYC: OTP → Aadhaar → Selfie → Bank
│   │   ├── PitchDefense/         # Judge Q&A Defense & IITM DSS Real Data Table
│   │   ├── ThreeD/               # Three.js 3D Digital Twin & Subsidised Baler Model
│   │   ├── Animated/             # Spotlights, Marquees & Kinetic Beams
│   │   └── Effects/              # Particle Field & ambient visual effects
│   ├── data/                     # Real Sangrur field polygons, machinery, buyers
│   ├── styles/                   # Theme CSS, hero animations, farmer-centric accents
│   ├── types/                    # TypeScript interfaces matching data model
│   └── utils/                    # OR-Tools simulator, spatial audit & dynamic pricing
├── index.html                    # SEO-optimised entry point with OG meta tags
└── README.md
```

---

## 🌍 Environmental Impact

Nirdhoom addresses the **Punjab stubble burning crisis** — a seasonal environmental emergency affecting 400+ million people across the Indo-Gangetic Plains every October-November.

| Impact Metric | Without Nirdhoom | With Nirdhoom |
|---------------|-----------------|---------------|
| **Field clearance method** | Open burning (₹0, 15 minutes) | Mechanised baling (guaranteed slot) |
| **CO₂e per acre** | ~1.8 tonnes released | ~1.8 tonnes avoided & verified |
| **Farmer payment timeline** | Never (burning is free) | <90 seconds via UPI |
| **Verification standard** | None | NASA FIRMS + Sentinel-2 (Verra VM0042) |
| **Straw end-use** | Ash and PM2.5 | Mushroom substrate, biochar, CBG, fodder |

---

## 📜 License & Credits

Built with precision for the Agricultural Carbon & Clean Air Initiative. Licensed under the [MIT License](LICENSE).

**Data Sources**: CAQM (Commission for Air Quality Management), IITM DSS, NASA FIRMS, Punjab Agriculture Department, Verra VCS Registry.

**Made with** ❤️ **for Punjab's farmers — ਕਿਸਾਨਾਂ ਲਈ**
