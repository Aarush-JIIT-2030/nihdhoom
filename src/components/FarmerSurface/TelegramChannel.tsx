import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { HindiTextConverter } from './HindiTextConverter';
import {
  Bell, CalendarCheck, Camera, CheckCircle2, ExternalLink, Link2, MapPin,
  Send, ShieldCheck, Smartphone as SmartphoneIcon, Sparkles
} from 'lucide-react';

const BOT_USERNAME = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || '';
const MINI_APP_URL = import.meta.env.VITE_TELEGRAM_MINI_APP_URL || '';

export function TelegramChannel() {
  const [language, setLanguage] = useState<'pa' | 'hi' | 'en'>('pa');
  const [linking, setLinking] = useState(false);
  const [linkError, setLinkError] = useState('');
  const [linkExpiresAt, setLinkExpiresAt] = useState('');
  const [botReady, setBotReady] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/notify/telegram-webhook', { method: 'GET', cache: 'no-store' })
      .then((res) => res.ok)
      .then((ok) => { if (active) setBotReady(ok); })
      .catch(() => { if (active) setBotReady(false); });
    return () => { active = false; };
  }, []);

  const botUrl = useMemo(() => BOT_USERNAME ? `https://t.me/${BOT_USERNAME}` : undefined, []);

  const copy = {
    pa: {
      title: 'NIRDHOOM Sathi',
      subtitle: 'ਬੁਕਿੰਗ, ਮਸ਼ੀਨ ਸਟੇਟਸ ਅਤੇ ਸਬੂਤ — ਇੱਕ ਸੌਖਾ ਕਿਸਾਨ ਚੈਨਲ',
      welcome: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ! Sathi ਤੁਹਾਡੇ NIRDHOOM ਖੇਤ ਦੇ workflow ਨੂੰ Telegram ਨਾਲ ਜੋੜਦਾ ਹੈ।',
      cta: 'Telegram ਖੋਲ੍ਹੋ',
      note: 'ਕੇਵਲ authenticated records ਤੋਂ live capacity, GPS ਅਤੇ verification status ਦਿਖਾਇਆ ਜਾਂਦਾ ਹੈ।',
    },
    hi: {
      title: 'NIRDHOOM Sathi',
      subtitle: 'बुकिंग, मशीन स्टेटस और सबूत — एक आसान किसान चैनल',
      welcome: 'नमस्ते! Sathi आपके NIRDHOOM खेत के workflow को Telegram से जोड़ता है।',
      cta: 'Telegram खोलें',
      note: 'Live capacity, GPS और verification status केवल authenticated records से दिखाए जाते हैं।',
    },
    en: {
      title: 'NIRDHOOM Sathi',
      subtitle: 'One simple farmer channel for booking, machine status and evidence',
      welcome: 'Hello! Sathi connects your NIRDHOOM field workflow to Telegram.',
      cta: 'Open Telegram',
      note: 'Live capacity, GPS and verification status are shown only from authenticated records.',
    },
  }[language];

  const connectTelegram = async () => {
    setLinking(true);
    setLinkError('');
    setLinkExpiresAt('');
    try {
      const sessionResult = await supabase?.auth.getSession();
      const accessToken = sessionResult?.data?.session?.access_token;
      if (!accessToken) {
        setLinkError('Sign in to NIRDHOOM first, then create a secure Telegram link.');
        return;
      }
      const response = await fetch('/api/notify/telegram-link', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: '{}',
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.bot_url) {
        setLinkError(payload.error || 'Unable to create a secure Telegram link.');
        return;
      }
      setLinkExpiresAt(payload.expires_at || '');
      window.open(payload.bot_url, '_blank', 'noopener,noreferrer');
    } catch {
      setLinkError('Telegram linking service is temporarily unavailable.');
    } finally {
      setLinking(false);
    }
  };

  const capabilityCards = [
    { icon: CalendarCheck, title: 'Book clearance', text: 'Open the real booking workflow and keep field selection inside NIRDHOOM.' },
    { icon: MapPin, title: 'Track the operation', text: 'See authenticated machine telemetry; stale readings remain visibly stale.' },
    { icon: Camera, title: 'Capture evidence', text: 'Evidence stays tied to an authenticated job before it can support verification.' },
  ];

  return (
    <section className="mx-auto w-full max-w-6xl space-y-5">
      <div className="overflow-hidden rounded-[28px] border border-emerald-900/10 bg-white shadow-[0_22px_70px_rgba(36,78,46,.09)]">
        <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.15fr_.85fr] lg:p-10">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-emerald-100/70 blur-3xl" />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#229ED9]/20 bg-[#229ED9]/8 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-[#197aa8]">
                <Send className="h-3.5 w-3.5" /> Telegram channel
              </span>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-black ${botReady === true ? 'bg-emerald-100 text-emerald-800' : botReady === false ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${botReady === true ? 'bg-emerald-500' : botReady === false ? 'bg-red-500' : 'bg-slate-400'}`} />
                {botReady === true ? 'READY' : botReady === false ? 'NOT CONFIGURED' : 'CHECKING'}
              </span>
            </div>
            <h2 className="mt-5 max-w-xl text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl">{copy.title}</h2>
            <p className="mt-3 max-w-xl text-base font-medium leading-7 text-slate-600">{copy.subtitle}</p>
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-900/10 bg-emerald-50/70 p-4">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
              <p className="text-sm font-semibold leading-6 text-emerald-950">{copy.welcome}</p>
            </div>

            <div className="mt-6 grid gap-2.5 sm:grid-cols-3">
              {capabilityCards.map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <Icon className="h-5 w-5 text-emerald-700" />
                  <h3 className="mt-3 text-sm font-black text-slate-950">{title}</h3>
                  <p className="mt-1.5 text-xs font-medium leading-5 text-slate-600">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex flex-col justify-center rounded-[24px] border border-[#229ED9]/15 bg-gradient-to-br from-[#229ED9]/8 via-white to-emerald-50/80 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#229ED9] text-white shadow-lg shadow-[#229ED9]/20">
                <Send className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">NIRDHOOM Bot</div>
                <div className="mt-0.5 text-lg font-black text-slate-950">{BOT_USERNAME ? `@${BOT_USERNAME}` : 'Not configured'}</div>
              </div>
            </div>

            <p className="mt-5 text-sm font-medium leading-6 text-slate-600">
              Start in Telegram, securely link your NIRDHOOM account, then use the farmer menu for fields, clearance, tracking, verification and residue.
            </p>

            <div className="mt-5 space-y-2.5">
              <a
                href={botUrl}
                target="_blank"
                rel="noreferrer"
                aria-disabled={!botUrl}
                onClick={(event) => { if (!botUrl) event.preventDefault(); }}
                className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#229ED9] ${botUrl ? 'bg-[#229ED9] shadow-md shadow-[#229ED9]/15' : 'cursor-not-allowed bg-slate-300'}`}
              >
                <Send className="h-4 w-4" /> {botUrl ? copy.cta : 'Configure Telegram first'} <ExternalLink className="h-4 w-4" />
              </a>

              <button
                type="button"
                onClick={connectTelegram}
                disabled={linking}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-emerald-900/12 bg-white px-4 py-3 text-sm font-black text-emerald-950 transition hover:bg-emerald-50 disabled:cursor-wait disabled:opacity-60"
              >
                <Link2 className="h-4 w-4 text-emerald-700" />
                {linking ? 'Creating secure link…' : 'Connect my NIRDHOOM account'}
              </button>
            </div>

            {linkExpiresAt && (
              <p className="mt-3 text-center text-[11px] font-bold text-emerald-700">
                Secure link created · expires {new Date(linkExpiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
            {linkError && <p role="alert" className="mt-3 text-center text-xs font-bold text-red-700">{linkError}</p>}

            {MINI_APP_URL && (
              <a href={MINI_APP_URL} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl border border-[#229ED9]/15 bg-white px-4 py-2.5 text-xs font-black text-[#197aa8] hover:bg-sky-50">
                <SmartphoneIcon className="h-4 w-4" /> Open Telegram Mini App <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>

        <div className="border-t border-slate-200 bg-slate-50/80 px-6 py-4 sm:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
              <p className="text-xs font-semibold leading-5 text-slate-600">{copy.note}</p>
            </div>
            <div className="flex gap-2">
              {[
                ['pa', 'ਪੰਜਾਬੀ'],
                ['hi', 'हिन्दी'],
                ['en', 'English'],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setLanguage(id as 'pa' | 'hi' | 'en')}
                  className={`min-h-9 rounded-lg border px-3 text-[11px] font-black transition ${language === id ? 'border-emerald-600 bg-emerald-700 text-white' : 'border-emerald-900/10 bg-white text-emerald-950 hover:bg-emerald-50'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <HindiTextConverter />
    </section>
  );
}
