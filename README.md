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

Traditional stubble aggregators buy balers (₹15–20 lakh each), store thousands of tonnes of bulky straw, and collapse from working capital starvation. Meanwhile, Punjab and Haryana already house **tens of thousands of idle balers, rakes, and Super Seeders** bought with **50% to 80% CRM government subsidy**, parked in Custom Hiring Centres (CHCs) and FPOs.

**Nirdhoom owns zero balers.** We unlock stranded public infrastructure with an autonomous dispatch and verification layer.

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
- **Pollution Attribution**: Defensible framing backed by **IITM Decision Support System (DSS)** and peer-reviewed WRF-Chem atmospheric modeling (10 Oct to 20 Nov 40-day window).
- **Satellite Audit Sensor**: NASA FIRMS NOAA-20 & Suomi-NPP VIIRS 375m resolution sensor.
- **Instant Settlement**: Instant UPI payouts settled in `<90 seconds` against field polygons.

---

## 🛠️ Tech Stack & Architecture

- **Frontend & UI**: React 19, TypeScript, TailwindCSS/Vanilla design system, Outfit & Plus Jakarta Sans typography.
- **3D Geospatial Digital Twin**: Three.js WebGL spatial simulation of Punjab Indo-Gangetic basin, orbital satellites, and radar cones.
- **GIS & Mapping**: Leaflet, GeoJSON, NASA FIRMS thermal hotspot integration.
- **Algorithmic Core**: Time-windowed vehicle routing optimization (Google OR-Tools VRP logic), PostGIS `ST_Contains` spatial intersection.
- **Farmer Surfaces**: Low-friction WhatsApp Cloud API simulation, Punjabi audio synthesizer voice notes, offline-first operator PWA.

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
│   └── images/              # High-res authentic ground photos & satellite visuals
├── src/
│   ├── components/
│   │   ├── Landing/         # Kinetic Bento Hero & Visual Telemetry
│   │   ├── AgenticConsole/  # 5-Agent Multi-Agent Holographic Swarm
│   │   ├── DemoWalkthrough/ # 4-Beat Hackathon Pitch Runner
│   │   ├── OpsConsole/      # Real-time GIS Map & OR-Tools VRP
│   │   ├── FarmerSurface/   # Punjabi WhatsApp & IVR Bot with Audio Synth
│   │   ├── FieldOperator/   # Offline PWA & <90s UPI Settlement
│   │   ├── VerificationLayer/# NASA FIRMS ST_Contains Audit & Carbon Certificate
│   │   ├── OfftakeAndForecast/# Multi-Offtake Auction & Sentinel-2 Harvest Forecast
│   │   ├── PitchDefense/    # Judge Q&A Defense & IITM DSS Table
│   │   ├── ThreeD/          # Three.js 3D Digital Twin & Subsidised Baler Model
│   │   └── Animated/        # Spotlights, Marquees & Kinetic Beams
│   ├── data/                # Real Sangrur field polygons, machinery, buyers, translations
│   ├── types/               # TypeScript interfaces matching Section 08 data model
│   └── utils/               # OR-Tools simulator, spatial audit & dynamic pricing
└── README.md
```

---

## 📜 License & Credits

Built with precision for the Agricultural Carbon & Clean Air Initiative. Licensed under the [MIT License](LICENSE).
