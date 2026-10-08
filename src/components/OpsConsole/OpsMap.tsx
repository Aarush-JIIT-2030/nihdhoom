import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Field, Machine, BurnEvent, StorageYard, Buyer, LatLng } from '../../types';
import { supabase } from '../../lib/supabase';
import { Layers, Flame, MapPin, PackageCheck, Route, CloudSun, Building2 } from 'lucide-react';

interface OpsMapProps {
  fields: Field[];
  machines: Machine[];
  fireEvents: BurnEvent[];
  storageYards: StorageYard[];
  buyers: Buyer[];
  selectedField: Field | null;
  onSelectField: (field: Field) => void;
  activeRoutePolyline?: LatLng[];
  highlightFirmsFire?: boolean;
  demoMode?: boolean;
}

export const OpsMap: React.FC<OpsMapProps> = ({
  fields,
  machines,
  fireEvents,
  storageYards,
  buyers,
  selectedField,
  onSelectField,
  activeRoutePolyline,
  highlightFirmsFire = true,
  demoMode = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const [tileMode] = useState<'satellite'>('satellite');
  const [showFires, setShowFires] = useState(true);
  const [showMachines, setShowMachines] = useState(true);
  const [showFields, setShowFields] = useState(true);
  const [showYards, setShowYards] = useState(true);
  const [showResidue, setShowResidue] = useState(true);
  const [showBuyers, setShowBuyers] = useState(true);
  const [showRoute, setShowRoute] = useState(true);
  const [showWeather, setShowWeather] = useState(true);
  const [weatherPoint, setWeatherPoint] = useState<{ temperature: number; precipitationProbability: number; precipitationMm: number; windGustKmh: number } | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [mapError, setMapError] = useState<string | null>(null);
  const [animatedPositions, setAnimatedPositions] = useState<Record<string, { lat: number; lng: number }>>(
    () => Object.fromEntries(machines.map(m => [m.id, m.current_location]))
  );
  const animFrameRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Centered at Sangrur, Punjab
    let map: L.Map;
    try {
      map = L.map(mapContainerRef.current, {
      center: [30.2458, 75.8421],
      zoom: 11,
      zoomControl: true,
      attributionControl: false,
    });
    } catch (error) {
      console.error('[NIRDHOOM] Leaflet initialization failed:', error);
      setMapError(error instanceof Error ? error.message : 'Unable to initialize the operational map.');
      return;
    }

    setMapError(null);
    mapInstanceRef.current = map;
    layerGroupRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Live fleet tracking animation: machines drift toward assigned fields every 5s
  useEffect(() => {
    const tick = () => {
      setAnimatedPositions((prev) => {
        const next = { ...prev };
        machines.forEach((machine, idx) => {
          const assignedField = fields[idx % fields.length];
          if (!assignedField) return;
          const target = assignedField.center;
          const cur = prev[machine.id] || machine.current_location;
          // Lerp 8% toward target to simulate GPS drift
          next[machine.id] = {
            lat: cur.lat + (target.lat - cur.lat) * 0.08,
            lng: cur.lng + (target.lng - cur.lng) * 0.08,
          };
        });
        return next;
      });
      setLastRefresh(new Date());
    };

    animFrameRef.current = setInterval(tick, 4500);
    return () => {
      if (animFrameRef.current) clearInterval(animFrameRef.current);
    };
  }, [machines, fields]);

    // Weather is an operational planning layer, sourced through the authenticated weather adapter.
  useEffect(() => {
    if (demoMode || !showWeather || !selectedField?.dbId || !supabase) {
      setWeatherPoint(null);
      return;
    }
    const client = supabase;
    let active = true;
    const loadWeather = async () => {
      try {
        const { data } = await client.auth.getSession();
        const token = data.session?.access_token;
        if (!token) return;
        const response = await fetch(`/api/weather?field_id=${encodeURIComponent(selectedField.dbId!)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) return;
        const payload = await response.json();
        const currentIndex = payload.forecast?.hourly?.time?.length ? 0 : -1;
        if (!active || currentIndex < 0) return;
        setWeatherPoint({
          temperature: Number(payload.forecast.hourly.temperature_2m?.[currentIndex] ?? 0),
          precipitationProbability: Number(payload.forecast.hourly.precipitation_probability?.[currentIndex] ?? 0),
          precipitationMm: Number(payload.forecast.hourly.precipitation?.[currentIndex] ?? 0),
          windGustKmh: Number(payload.forecast.hourly.wind_gusts_10m?.[currentIndex] ?? 0),
        });
      } catch {
        if (active) setWeatherPoint(null);
      }
    };
    void loadWeather();
    return () => { active = false; };
  }, [demoMode, selectedField?.dbId, showWeather]);

// Update base tile layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    // Machine tracking uses a field satellite layer only; avoid a second visual language.
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 18, maxNativeZoom: 17 }
    ).addTo(map);
  }, [tileMode]);

  // Render Polygons, Markers, FIRMS Fires, and Route
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // 1. Render Registered Customer Fields (Polygons)
    if (showFields) {
      fields.forEach((field) => {
        const isSelected = selectedField?.id === field.id;
        const coords: [number, number][] = (field.geometry || [])
          .filter((p) => Number.isFinite(Number(p?.lat)) && Number.isFinite(Number(p?.lng)))
          .map((p) => [Number(p.lat), Number(p.lng)] as [number, number]);
        if (coords.length < 3) return;

        let fillColor = '#10b981'; // Green: Cleared / Verified
        let strokeColor = '#34d399';

        if (field.status === 'BALING_IN_PROGRESS') {
          fillColor = '#f59e0b'; // Amber
          strokeColor = '#fbbf24';
        } else if (field.status === 'SCHEDULED') {
          fillColor = '#06b6d4'; // Cyan
          strokeColor = '#22d3ee';
        } else if (field.status === 'REGISTERED') {
          fillColor = '#8b5cf6'; // Purple
          strokeColor = '#a78bfa';
        }

        const polygon = L.polygon(coords, {
          color: isSelected ? '#ffffff' : strokeColor,
          weight: isSelected ? 3 : 2,
          fillColor: fillColor,
          fillOpacity: isSelected ? 0.65 : 0.35,
          dashArray: field.status === 'REGISTERED' ? '4, 4' : undefined,
        });

        polygon.bindTooltip(
          `<strong>${field.khasra_no}</strong><br/>${field.farmer_name}<br/>${field.acreage} ac (${field.paddy_variety})<br/><span style="color:#10b981;font-weight:bold;">FIRMS observations are supporting evidence only • Planning window</span>`,
          { direction: 'top', className: 'leaflet-custom-tooltip' }
        );

        polygon.on('click', () => {
          onSelectField(field);
        });

        polygon.addTo(layerGroup);
      });
    }

    // 2. Render Registered Machine Capacity
    if (showMachines) {
      machines.forEach((machine) => {
        const iconHtml = `
          <div style="position:relative;display:flex;align-items:center;justify-content:center;">
            <div style="width:34px;height:34px;border-radius:50%;background:#022c22;border:2px solid #10b981;display:flex;align-items:center;justify-content:center;box-shadow:0 0 14px rgba(16,185,129,0.8);">
              <span style="font-size:16px;">🚜</span>
            </div>
            <div style="position:absolute;bottom:-18px;white-space:nowrap;background:#0f172a;border:1px solid #10b981;border-radius:4px;padding:1px 5px;font-size:10px;font-weight:bold;color:#34d399;">
              ${machine.name.split(' ')[0]} #${machine.id.slice(-2)}
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-baler-icon',
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });

        const pos = animatedPositions[machine.id] || machine.current_location;
        if (!Number.isFinite(Number(pos?.lat)) || !Number.isFinite(Number(pos?.lng))) return;
        const marker = L.marker([Number(pos.lat), Number(pos.lng)], {
          icon: customIcon,
        });

        marker.bindPopup(`
          <div style="padding:4px;font-family:sans-serif;font-size:12px;">
            <div style="font-weight:bold;color:#10b981;font-size:14px;">${machine.name}</div>
            <div style="color:#94a3b8;margin-bottom:6px;">${machine.home_chc}</div>
            <div><strong>Type:</strong> ${machine.type}</div>
            <div><strong>Capacity:</strong> ${machine.capacity_acres_day} acres/day</div>
            <div><strong>Tractor:</strong> ${machine.tractor_hp_required ? machine.tractor_hp_required + " HP" : "Not sourced"}</div>
            <div><strong>Residue:</strong> ${(machine.residue_types || ["Not established"]).join(", ")}</div>
            <div><strong>Operator:</strong> ${machine.operator_name} (${machine.operator_phone})</div>
            <div style="margin-top:4px;color:#718076;">Capability source: ${machine.capability_source || "Not established"}${machine.capability_source_date ? " · " + machine.capability_source_date : ""}</div>
            <div><strong>Status:</strong> <span style="color:#34d399;font-weight:bold;">${machine.status}</span></div>
          </div>
        `);

        marker.addTo(layerGroup);
      });
    }

    // 3. Render NASA FIRMS Active Fire Anomalies (Red Pulsing Beacons)
    if (showFires && highlightFirmsFire) {
      fireEvents.forEach((fire) => {
        const fireHtml = `
          <div style="position:relative;display:flex;align-items:center;justify-content:center;">
            <div style="width:28px;height:28px;border-radius:50%;background:rgba(239,68,68,0.25);position:absolute;animation:ping-slow 2s infinite;"></div>
            <div style="width:20px;height:20px;border-radius:50%;background:#ef4444;border:2px solid #ffffff;display:flex;align-items:center;justify-content:center;box-shadow:0 0 16px #ef4444;">
              <span style="font-size:10px;">🔥</span>
            </div>
          </div>
        `;

        const fireIcon = L.divIcon({
          html: fireHtml,
          className: 'custom-fire-icon',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        if (!Number.isFinite(Number(fire.firms_point?.lat)) || !Number.isFinite(Number(fire.firms_point?.lng))) return;
        const marker = L.marker([Number(fire.firms_point.lat), Number(fire.firms_point.lng)], {
          icon: fireIcon,
        });

        marker.bindPopup(`
          <div style="padding:6px;font-family:sans-serif;font-size:12px;color:#f87171;">
            <div style="font-weight:bold;font-size:13px;color:#ef4444;">🔥 NASA FIRMS VIIRS Active Fire</div>
            <div style="color:#cbd5e1;margin-top:2px;">Location: ${fire.nearest_village}</div>
            <div style="color:#94a3b8;margin-top:2px;">Satellite: ${fire.satellite}</div>
            <div style="color:#fbbf24;margin-top:2px;">Confidence: ${fire.confidence}% | Temp: ${fire.brightness_temp_kelvin} K</div>
            <div style="margin-top:4px;padding:3px 6px;border-radius:4px;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.4);color:#fca5a5;font-weight:bold;font-size:11px;">
              ⚠️ UNREGISTERED FIELD (NO NIRDHOOM CONTRACT)
            </div>
          </div>
        `);

        marker.addTo(layerGroup);
      });
    }

        // 4. Render residue lots at their field origin.
    if (showResidue) {
      fields
        .filter((field) => Boolean(field.residue_lot_id) || field.status === 'VERIFIED_NON_BURN')
        .forEach((field) => {
          const pos = field.center;
          if (!Number.isFinite(Number(pos?.lat)) || !Number.isFinite(Number(pos?.lng))) return;
          const icon = L.divIcon({
            html: '<div style="width:26px;height:26px;border-radius:7px;background:#F0F7EF;border:2px solid #2D6A45;display:flex;align-items:center;justify-content:center;color:#2D6A45;font-size:12px;">🌾</div>',
            className: 'residue-lot-icon',
            iconSize: [26, 26],
            iconAnchor: [13, 13],
          });
          L.marker([Number(pos.lat), Number(pos.lng)], { icon })
            .bindPopup(`<div style="padding:4px;font-family:sans-serif;font-size:12px;"><strong style="color:#2D6A45;">Residue lot</strong><div>Field: ${field.khasra_no}</div><div>Status: ${field.status.replaceAll('_',' ')}</div><div>Source: field record</div></div>`)
            .addTo(layerGroup);
        });
    }

    // 5. Render buyer demand only where a real/explicit buyer coordinate exists.
    if (showBuyers) {
      buyers.forEach((buyer) => {
        const pos = buyer.location;
        if (!pos || !Number.isFinite(Number(pos.lat)) || !Number.isFinite(Number(pos.lng))) return;
        const icon = L.divIcon({
          html: '<div style="width:27px;height:27px;border-radius:7px;background:#FFF7E8;border:2px solid #C8953D;display:flex;align-items:center;justify-content:center;color:#76521B;font-size:12px;">🏭</div>',
          className: 'buyer-icon',
          iconSize: [27, 27],
          iconAnchor: [13.5, 13.5],
        });
        L.marker([Number(pos.lat), Number(pos.lng)], { icon })
          .bindPopup(`<div style="padding:4px;font-family:sans-serif;font-size:12px;"><strong style="color:#76521B;">${buyer.name}</strong><div>${buyer.location_name}</div><div>Demand: ${buyer.demand_tonnes.toLocaleString('en-IN')} t</div><div>Price: ₹${buyer.price_per_tonne.toLocaleString('en-IN')}/t</div><div style="margin-top:4px;color:#718076;">Buyer coordinates are explicit demo/reference data when present.</div></div>`)
          .addTo(layerGroup);
      });
    }

    // 6. Render authenticated weather planning signal for the selected field.
    if (showWeather && selectedField?.center && weatherPoint) {
      const pos = selectedField.center;
      const risk = weatherPoint.precipitationProbability >= 70 || weatherPoint.precipitationMm >= 8 || weatherPoint.windGustKmh >= 35;
      const icon = L.divIcon({
        html: `<div style="width:30px;height:30px;border-radius:50%;background:${risk ? '#FFF3D6' : '#EFF7F0'};border:2px solid ${risk ? '#C8953D' : '#2D6A45'};display:flex;align-items:center;justify-content:center;font-size:13px;">☁️</div>`,
        className: 'weather-icon',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });
      L.marker([Number(pos.lat), Number(pos.lng)], { icon })
        .bindPopup(`<div style="padding:4px;font-family:sans-serif;font-size:12px;"><strong style="color:#2D6A45;">Weather planning signal</strong><div>${weatherPoint.temperature.toFixed(0)}°C · rain probability ${weatherPoint.precipitationProbability.toFixed(0)}%</div><div>${weatherPoint.precipitationMm.toFixed(1)} mm rain · gusts ${weatherPoint.windGustKmh.toFixed(0)} km/h</div><div style="margin-top:4px;color:#718076;">Planning signal only; confirm field and machine conditions before dispatch.</div></div>`)
        .addTo(layerGroup);
    }

// 4. Render Storage Yards & Buyers
    if (showYards) {
      storageYards.forEach((yard) => {
        const yardHtml = `
          <div style="width:26px;height:26px;border-radius:6px;background:#1e293b;border:2px solid #3b82f6;display:flex;align-items:center;justify-content:center;box-shadow:0 0 10px rgba(59,130,246,0.6);">
            <span style="font-size:12px;">🏭</span>
          </div>
        `;

        const yardIcon = L.divIcon({
          html: yardHtml,
          className: 'yard-icon',
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        if (!Number.isFinite(Number(yard.location?.lat)) || !Number.isFinite(Number(yard.location?.lng))) return;
        const marker = L.marker([Number(yard.location.lat), Number(yard.location.lng)], {
          icon: yardIcon,
        });

        marker.bindPopup(`
          <div style="padding:4px;font-family:sans-serif;font-size:12px;">
            <div style="font-weight:bold;color:#60a5fa;">${yard.name}</div>
            <div>Capacity: ${yard.capacity_tonnes} tonnes</div>
            <div>Current Stock: ${yard.current_load} tonnes</div>
          </div>
        `);

        marker.addTo(layerGroup);
      });
    }

    // 7. Render Active VRP Polyline Route
    if (showRoute && activeRoutePolyline && activeRoutePolyline.length > 1) {
      const lineCoords: [number, number][] = activeRoutePolyline.map((p) => [p.lat, p.lng]);
      const routeLine = L.polyline(lineCoords, {
        color: '#10b981',
        weight: 4,
        opacity: 0.9,
        dashArray: '8, 8',
      });
      routeLine.addTo(layerGroup);
    }
  }, [
    fields,
    machines,
    fireEvents,
    storageYards,
    buyers,
    selectedField,
    activeRoutePolyline,
    highlightFirmsFire,
    showFields,
    showMachines,
    showFires,
    showYards,
    showResidue,
    showBuyers,
    showRoute,
    showWeather,
    weatherPoint,
    animatedPositions,
  ]);

  // Pan to selected field
  useEffect(() => {
    if (selectedField && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(
        [selectedField.center.lat, selectedField.center.lng],
        13,
        { duration: 1.2 }
      );
    }
  }, [selectedField]);

  return (
    <div className="ops-map-surface relative w-full h-[540px] lg:h-[620px] rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* Field GIS map — the operational tracking surface. */}
      {mapError ? (
        <div className="w-full h-full grid place-items-center bg-slate-50 p-6 text-center">
          <div className="max-w-md">
            <div className="text-sm font-bold text-amber-700">Operational map unavailable</div>
            <p className="mt-2 text-xs text-slate-500">Check your network/map tile access and reload.</p>
            <p className="mt-2 text-[10px] text-slate-500 break-words">{mapError}</p>
          </div>
        </div>
      ) : (
        <div ref={mapContainerRef} className="w-full h-full z-0" />
      )}

      {/* GPS Live Ticker Top-Left */}
      <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-md border border-slate-200 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs shadow-lg">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        <span className="text-emerald-700 font-bold">{demoMode ? 'GPS DEMO' : 'GPS LIVE'}</span>
        <span className="text-slate-400">·</span>
        <span className="text-slate-600 font-mono">{machines.length} balers {demoMode ? 'simulated' : 'tracked'}</span>
        <span className="text-slate-500 text-[10px] ml-1">Updated {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
      </div>

      {/* Floating Control Overlay Top-Right */}
      <div className="absolute top-3 right-3 z-10">
        <div className="rounded-lg border border-slate-200 bg-white/95 p-2 text-xs font-semibold text-slate-700 shadow-lg backdrop-blur-md">
          Satellite field map
        </div>
        <div className="mt-2 flex flex-col gap-1.5 rounded-lg border border-slate-200 bg-white/95 p-2 text-xs font-medium text-slate-700 shadow-lg backdrop-blur-md">
          <div className="mb-0.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <Layers className="h-3 w-3 text-emerald-600" />
            <span>GIS map layers</span>
          </div>
          <label className="flex min-h-9 items-center justify-between gap-3 cursor-pointer rounded-md px-1 hover:bg-slate-50">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
              <span>Field polygons ({fields.length})</span>
            </span>
            <input type="checkbox" checked={showFields} onChange={(e) => setShowFields(e.target.checked)} className="accent-emerald-600 rounded" />
          </label>
          <label className="flex min-h-9 items-center justify-between gap-3 cursor-pointer rounded-md px-1 hover:bg-slate-50">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span>Machines ({machines.length})</span>
            </span>
            <input type="checkbox" checked={showMachines} onChange={(e) => setShowMachines(e.target.checked)} className="accent-emerald-600 rounded" />
          </label>
          <label className="flex min-h-9 items-center justify-between gap-3 cursor-pointer rounded-md px-1 hover:bg-slate-50">
            <span className="flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-red-500" />
              <span className="font-semibold text-red-600">FIRMS observations ({fireEvents.length})</span>
            </span>
            <input type="checkbox" checked={showFires} onChange={(e) => setShowFires(e.target.checked)} className="accent-red-500 rounded" />
          </label>
          <label className="flex min-h-9 items-center justify-between gap-3 cursor-pointer rounded-md px-1 hover:bg-slate-50">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-blue-500" />
              <span>Yards & offtake ({storageYards.length})</span>
            </span>
            <input type="checkbox" checked={showYards} onChange={(e) => setShowYards(e.target.checked)} className="accent-blue-600 rounded" />
          </label>
          <label className="flex min-h-9 items-center justify-between gap-3 cursor-pointer rounded-md px-1 hover:bg-slate-50">
            <span className="flex items-center gap-1.5"><PackageCheck className="h-3.5 w-3.5 text-emerald-600" /><span>Residue lots</span></span>
            <input type="checkbox" checked={showResidue} onChange={(e) => setShowResidue(e.target.checked)} className="accent-emerald-600 rounded" />
          </label>
          <label className="flex min-h-9 items-center justify-between gap-3 cursor-pointer rounded-md px-1 hover:bg-slate-50">
            <span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-amber-600" /><span>Buyer demand ({buyers.filter((buyer) => buyer.location).length} mapped)</span></span>
            <input type="checkbox" checked={showBuyers} onChange={(e) => setShowBuyers(e.target.checked)} className="accent-amber-600 rounded" />
          </label>
          <label className="flex min-h-9 items-center justify-between gap-3 cursor-pointer rounded-md px-1 hover:bg-slate-50">
            <span className="flex items-center gap-1.5"><CloudSun className="h-3.5 w-3.5 text-sky-600" /><span>Weather planning</span></span>
            <input type="checkbox" checked={showWeather} onChange={(e) => setShowWeather(e.target.checked)} className="accent-sky-600 rounded" />
          </label>
          <label className="flex min-h-9 items-center justify-between gap-3 cursor-pointer rounded-md px-1 hover:bg-slate-50">
            <span className="flex items-center gap-1.5"><Route className="h-3.5 w-3.5 text-blue-600" /><span>Pickup route</span></span>
            <input type="checkbox" checked={showRoute} onChange={(e) => setShowRoute(e.target.checked)} className="accent-blue-600 rounded" />
          </label>

        </div>
      </div>

      {/* Floating Bottom Quick Zoom Bar */}
      <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-md border border-slate-200 rounded-lg p-1.5 flex items-center gap-2 shadow-lg text-xs text-slate-700">
        <span className="text-slate-400 font-medium px-1 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span>Hotspot Clusters:</span>
        </span>
        <button
          onClick={() => mapInstanceRef.current?.flyTo([30.2458, 75.8421], 12)}
          className="px-2 py-0.5 rounded bg-slate-50 hover:bg-emerald-50 text-slate-700 border border-slate-200 text-xs cursor-pointer"
        >
          Sangrur
        </button>
        <button
          onClick={() => mapInstanceRef.current?.flyTo([30.1311, 75.8016], 13)}
          className="px-2 py-0.5 rounded bg-slate-50 hover:bg-emerald-50 text-slate-700 border border-slate-200 text-xs cursor-pointer"
        >
          Sunam
        </button>
        <button
          onClick={() => mapInstanceRef.current?.flyTo([30.3683, 75.8672], 13)}
          className="px-2 py-0.5 rounded bg-slate-50 hover:bg-emerald-50 text-slate-700 border border-slate-200 text-xs cursor-pointer"
        >
          Dhuri
        </button>
        <button
          onClick={() => mapInstanceRef.current?.flyTo([30.2766, 76.0427], 13)}
          className="px-2 py-0.5 rounded bg-slate-50 hover:bg-emerald-50 text-slate-700 border border-slate-200 text-xs cursor-pointer"
        >
          Bhawanigarh
        </button>
      </div>

      {/* Floating Map Legend Bottom-Right */}
      <div className="absolute bottom-3 right-3 z-10 hidden sm:flex items-center gap-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] text-slate-700 shadow-lg">
        <span className="flex items-center gap-1">
          <span className="w-3 h-2 rounded bg-emerald-500 border border-emerald-300 inline-block"></span>
          <span>Field status / verified evidence</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-2 rounded bg-amber-500 border border-amber-300 inline-block"></span>
          <span>Baler Active</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping inline-block"></span>
          <span className="text-red-600 font-semibold">External thermal observation</span>
        </span>
      </div>
    </div>
  );
};
