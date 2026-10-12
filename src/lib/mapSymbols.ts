/**
 * Map marker symbols as inline SVG, so every operating system draws the same
 * baler, fire, yard and buyer icons (emoji render differently per device).
 * Each builder returns an HTML string for a Leaflet divIcon.
 */
import type { BuyerType, Machine } from '../types';

const svg = (inner: string, size = 18, extra = '') =>
  `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${inner}</svg>`;

const GLYPH = {
  tractor: '<circle cx="6.5" cy="16" r="3.6"/><circle cx="18.2" cy="17.6" r="2.1"/><path d="M10.2 16H16M3.5 12.6V7.5h6.2l1.6 5.1M9.7 7.5V4.8h3.4l1.7 4.4h4.1l1.5 3.9"/>',
  flame: '<path d="M12 2.5c.9 3.2 4.6 5.1 4.6 9.6a4.6 4.6 0 0 1-9.2 0c0-1.6.7-2.9 1.7-3.9.2 1.2.8 2 1.6 2.1-.1-2.6.2-5.3 1.3-7.8z" fill="currentColor" stroke="none"/>',
  yard: '<path d="M3 10.5 12 4.5l9 6V20H3z"/><path d="M9 20v-6h6v6"/>',
  factory: '<path d="M3 20V9.5l6 3V9.5l6 3V5h3.5v15z"/><path d="M7 16h1M12 16h1M16.5 16h.5"/>',
  bale: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.2"/><circle cx="12" cy="12" r="1"/>',
};

export type MachineStatus = Machine['status'];

const STATUS_RING: Record<MachineStatus, { ring: string; label: string }> = {
  BALING: { ring: '#e8821b', label: 'Baling' },
  EN_ROUTE: { ring: '#3a4fb8', label: 'En route' },
  IDLE: { ring: '#0f6e3a', label: 'Idle' },
  MAINTENANCE: { ring: '#8a8f98', label: 'Maintenance' },
};

export const machineStatusLabel = (status: MachineStatus) => STATUS_RING[status]?.label ?? status;

export function machineShortLabel(machine: Pick<Machine, 'type' | 'id'>): string {
  const type = machine.type || '';
  const kind = /seeder/i.test(type) ? 'Seeder' : /rake/i.test(type) ? 'Rake' : 'Baler';
  return `${kind} ${machine.id.replace(/\D/g, '').slice(-2) || machine.id.slice(-2)}`;
}

export function machineSymbol(machine: Pick<Machine, 'type' | 'id' | 'status'>): string {
  const meta = STATUS_RING[machine.status] ?? STATUS_RING.IDLE;
  return `<div class="map-machine is-${String(machine.status).toLowerCase().replace('_', '-')}" style="--ring:${meta.ring}">
    <div class="map-machine-dot">${svg(GLYPH.tractor, 19)}</div>
    <div class="map-machine-label">${machineShortLabel(machine)}</div>
  </div>`;
}

export function fireSymbol(hot: boolean, registered: boolean): string {
  return `<div class="map-fire ${hot ? 'is-hot' : ''} ${registered ? 'is-registered' : ''}">
    ${hot ? '<div class="map-fire-pulse"></div>' : ''}
    <div class="map-fire-dot">${svg(GLYPH.flame, 13)}</div>
  </div>`;
}

export const yardSymbol = (state: 'AVAILABLE' | 'WATCH' | 'FULL' | string = 'AVAILABLE') =>
  `<div class="map-tile-icon is-sky ${state === 'FULL' ? 'is-full' : state === 'WATCH' ? 'is-watch' : ''}">${svg(GLYPH.yard, 16)}</div>`;

export const buyerSymbol = (_type?: BuyerType) => `<div class="map-tile-icon is-wheat">${svg(GLYPH.factory, 16)}</div>`;

export const residueSymbol = () => `<div class="map-tile-icon is-green">${svg(GLYPH.bale, 16)}</div>`;

/** "5 h ago" from a FIRMS-style "YYYY-MM-DD HH:MM:SS UTC" stamp. */
export function timeAgo(stamp: string, now = Date.now()): string {
  const ms = Date.parse(String(stamp).replace(' UTC', 'Z').replace(' ', 'T'));
  if (!Number.isFinite(ms)) return '';
  const mins = Math.max(0, Math.round((now - ms) / 60_000));
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `${hours} h ago`;
  return `${Math.round(hours / 24)} d ago`;
}
