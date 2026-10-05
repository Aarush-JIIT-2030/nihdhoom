import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, ClipboardCheck, Loader2, MapPin, ShieldCheck, Tractor } from 'lucide-react';
import { Field } from '../../types';
import { supabase } from '../../lib/supabase';

interface Props {
  fields: Field[];
  demoMode: boolean;
  onBooked: (fieldId: string, amount?: number) => void;
}

export function ClearanceBooking({ fields, demoMode, onBooked }: Props) {
  const bookable = useMemo(
    () => fields.filter((f) => !['VERIFIED_NON_BURN'].includes(f.status)),
    [fields],
  );
  const [fieldId, setFieldId] = useState(bookable[0]?.id || '');
  const [date, setDate] = useState(() => new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!fieldId && bookable[0]?.id) setFieldId(bookable[0].id);
    if (fieldId && !bookable.some((field) => field.id === fieldId)) setFieldId(bookable[0]?.id || '');
  }, [bookable, fieldId]);

  const selected = bookable.find((f) => f.id === fieldId);
  const estimate = selected ? Math.round(Math.max(0, Number(selected.acreage || 0)) * 1500) : 0;

  async function book() {
    setError('');
    setMessage('');
    if (!selected || !date) {
      setError('Please choose your field and pickup date first.');
      return;
    }
    if (new Date(date) < new Date(new Date().toISOString().slice(0, 10))) {
      setError('Please choose today or a future date.');
      return;
    }

    setBusy(true);
    try {
      if (demoMode) {
        onBooked(selected.id, estimate);
        setMessage('Example pickup booked. No real payment was made.');
        return;
      }
      if (!supabase) throw new Error('Live Supabase is not configured.');
      const { data, error: rpcError } = await supabase.rpc('reserve_clearance_booking_v2', {
        p_field_id: selected.dbId || selected.id,
        p_requested_date: date,
      });
      if (rpcError) throw new Error(rpcError.message);
      onBooked(selected.id, Number((data as { quoted_amount?: number } | null)?.quoted_amount || 0));
      setMessage('Book parali pickup confirmed by the server. The authoritative quote is shown in your field record.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Booking could not be created.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="farmer-surface farmer-booking mx-auto max-w-5xl space-y-4">
      <section className="rounded-2xl border border-emerald-500/20 bg-slate-950/75 p-5 shadow-xl shadow-emerald-950/10">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-300">
            <Tractor className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-300">
              <ClipboardCheck className="h-3.5 w-3.5" /> Book parali pickup
            </div>
            <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">Book parali pickup</h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
              Choose your field and the day you want the machine to come. In Live mode, the final quote is decided by the server.
            </p>
          </div>
        </div>
      </section>

      <section className="farmer-step-strip" aria-label="Booking steps">
        <div className="is-current"><span>1</span><strong>Choose your field</strong><small>Select the field where parali needs to be collected</small></div>
        <i aria-hidden="true" />
        <div><span>2</span><strong>Choose a date</strong><small>Tell us when you want the machine</small></div>
        <i aria-hidden="true" />
        <div><span>3</span><strong>Confirm</strong><small>Check details and book</small></div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/65 p-5">
          <label className="mb-2 block text-xs font-bold text-slate-400">Field</label>
          <select value={fieldId} onChange={(e) => setFieldId(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm font-semibold text-white focus:border-emerald-500 focus:outline-none">
            {bookable.length === 0 && <option value="">No bookable fields</option>}
            {bookable.map((field) => (
              <option key={field.id} value={field.id}>{field.khasra_no} · {field.village} · {Number(field.acreage).toFixed(2)} ac</option>
            ))}
          </select>

          {selected && (
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                <span className="block text-[10px] uppercase tracking-wider text-slate-500">Current status</span>
                <strong className="mt-1 block text-sm text-emerald-300">{selected.status.replace(/_/g, ' ')}</strong>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                <span className="block text-[10px] uppercase tracking-wider text-slate-500">Area</span>
                <strong className="mt-1 block text-sm text-white">{Number(selected.acreage).toFixed(2)} acres</strong>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                <span className="block text-[10px] uppercase tracking-wider text-slate-500">Location</span>
                <strong className="mt-1 flex items-center gap-1 text-sm text-white"><MapPin className="h-3.5 w-3.5 text-emerald-300" /> {selected.village}</strong>
              </div>
            </div>
          )}

          <label className="mt-5 mb-2 block text-xs font-bold text-slate-400">When should the machine come?</label>
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-300" />
            <input type="date" value={date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setDate(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3 pl-10 pr-3 text-sm font-semibold text-white focus:border-emerald-500 focus:outline-none" />
          </div>

          <button type="button" onClick={() => void book()} disabled={!selected || busy} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {busy ? 'Confirming booking…' : demoMode ? 'Book example pickup' : 'Book my pickup'}
          </button>

          {error && <div role="alert" className="mt-3 rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-xs text-red-200">{error}</div>}
          {message && <div role="status" className="mt-3 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3 text-xs text-emerald-200">{message}</div>}
        </div>

        <aside className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
          <div className="flex items-center gap-2 text-amber-200"><ShieldCheck className="h-4 w-4" /><strong className="text-sm">Good to know</strong></div>
          <div className="mt-4 space-y-3 text-xs leading-5 text-slate-300">
            <p>• Your final Live quote comes from NIRDHOOM — you cannot change it from this screen.</p>
            <p>• Live booking needs your consent and a registered field.</p>
            <p>• Demo mode changes example data only.</p>
            <p>• Payment is not connected in this version.</p>
          </div>
          <div className="mt-5 rounded-xl border border-amber-500/15 bg-slate-950/40 p-3">
            <span className="block text-[10px] uppercase tracking-wider text-slate-500">Example estimate</span>
            <strong className="mt-1 block text-xl font-black text-amber-200">₹{estimate.toLocaleString()}</strong>
            <span className="text-[10px] text-slate-500">Example only · Live quote comes from NIRDHOOM</span>
          </div>
        </aside>
      </section>
    </div>
  );
}
