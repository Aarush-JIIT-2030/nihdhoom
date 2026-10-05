import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import {
  UserCheck,
  Phone,
  MapPin,
  Shield,
  CreditCard,
  CheckCircle2,
  Circle,
  ChevronRight,
  Sparkles,
  Fingerprint,
  Landmark,
  Smartphone,
  Camera,
  Wheat,
  Loader2,
} from 'lucide-react';

type KYCStep = 'PHONE' | 'OTP' | 'CONSENT' | 'AADHAAR' | 'FACE_SCAN' | 'BANK' | 'LAND_RECORDS' | 'DONE';

const STEPS: { id: KYCStep; label: string; sublabel: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'PHONE', label: 'Mobile Verification', sublabel: 'Enter registered mobile', icon: Phone },
  { id: 'OTP', label: 'OTP Confirm', sublabel: '6-digit SMS code', icon: Smartphone },
  { id: 'CONSENT', label: 'Farmer consent', sublabel: 'Operational data agreement', icon: Shield },
  { id: 'AADHAAR', label: 'Identity verification (demo)', sublabel: 'Demo only — no external identity API', icon: Fingerprint },
  { id: 'FACE_SCAN', label: 'Selfie match (demo)', sublabel: 'Demo state — no biometric processing', icon: Camera },
  { id: 'BANK', label: 'Bank link (demo)', sublabel: 'Demo state — no bank verification', icon: Landmark },
  { id: 'LAND_RECORDS', label: 'Land records (demo)', sublabel: 'Demo state — no registry lookup', icon: Wheat },
  { id: 'DONE', label: 'Demo profile created', sublabel: 'Not registered in a live system', icon: CheckCircle2 },
];

const STEP_ORDER: KYCStep[] = ['PHONE', 'OTP', 'CONSENT', 'AADHAAR', 'FACE_SCAN', 'BANK', 'LAND_RECORDS', 'DONE'];
const DEMO_MODE = import.meta.env.VITE_NIRDHOOM_DEMO_MODE === 'true';

export const FarmerOnboarding: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<KYCStep>('PHONE');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [aadhaarLast4, setAadhaarLast4] = useState('');
  const [name, setName] = useState('');
  const [village, setVillage] = useState('');
  const [block, setBlock] = useState('');
  const [khasra, setKhasra] = useState('');
  const [acreage, setAcreage] = useState('');
  const [loading, setLoading] = useState(false);
  const [faceScanned, setFaceScanned] = useState(false);
  const [bankVerified, setBankVerified] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = window.setInterval(() => setResendSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [resendSeconds]);

  const stepIndex = STEP_ORDER.indexOf(currentStep);

  const advance = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const next = STEP_ORDER[stepIndex + 1];
      if (next) setCurrentStep(next);
    }, 900);
  };

  const normalizedPhone = phone ? `+91${phone}` : '';

  const sendLiveOtp = async () => {
    if (DEMO_MODE) return advance();
    if (!supabase) {
      setOtpError('Live authentication is not configured.');
      return;
    }
    setLoading(true);
    setOtpError('');
    const { error } = await supabase.auth.signInWithOtp({
      phone: normalizedPhone,
      options: { shouldCreateUser: true },
    });
    setLoading(false);
    if (error) {
      setOtpError(error.message || 'Unable to send OTP.');
      return;
    }
    setResendSeconds(45);
    setCurrentStep('OTP');
  };

  const verifyLiveOtp = async () => {
    if (DEMO_MODE) return advance();
    if (!supabase) {
      setOtpError('Live authentication is not configured.');
      return;
    }
    setLoading(true);
    setOtpError('');
    const { data, error } = await supabase.auth.verifyOtp({
      phone: normalizedPhone,
      token: otp,
      type: 'sms',
    });
    if (error || !data.user) {
      setLoading(false);
      setOtpError(error?.message || 'OTP verification failed.');
      return;
    }
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: data.user.id,
      full_name: name,
      phone: normalizedPhone,
      village,
    }, { onConflict: 'id' });
    setLoading(false);
    if (profileError) {
      setOtpError(profileError.message || 'Verified, but farmer profile could not be saved.');
      return;
    }
    setCurrentStep('CONSENT');
  };

  const reset = () => {
    setCurrentStep('PHONE');
    setPhone(''); setOtp(''); setAadhaarLast4(''); setName(''); setVillage('');
    setBlock(''); setKhasra(''); setAcreage('');
    setFaceScanned(false); setBankVerified(false); setOtpError(''); setConsentAccepted(false);
  };

  const isComplete = (step: KYCStep) => STEP_ORDER.indexOf(step) < stepIndex;
  const isCurrent = (step: KYCStep) => step === currentStep;

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto p-2">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950 p-5 shadow-[0_20px_60px_rgba(0,0,0,.20)] sm:p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/15 text-amber-300 border border-amber-300/30 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/10">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-lg text-white font-['Outfit']">
                Farmer KYC & Onboarding Flow
              </h3>
              <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-2.5 py-1 text-[11px] font-black text-amber-200">{DEMO_MODE ? 'SIMULATION' : 'LIVE OTP'}</span>
            </div>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-6">
              <span className="font-semibold text-white">Mobile OTP is live.</span> Identity, biometric, bank and cadastral steps remain explicit demo/adapter states until their authorized providers are connected.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Steps Sidebar */}
        <div className="lg:col-span-4">
          <div className="glass-panel p-4 flex flex-col gap-1.5 rounded-3xl">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Onboarding Progress
            </h4>
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const done = isComplete(step.id);
              const current = isCurrent(step.id);
              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-3 p-2.5 rounded-lg transition-all ${
                    current
                      ? 'bg-emerald-950/60 border border-emerald-500/50'
                      : done
                      ? 'opacity-70'
                      : 'opacity-40'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-extrabold ${
                    done
                      ? 'bg-emerald-500 text-slate-950'
                      : current
                      ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-400'
                      : 'bg-slate-800 text-slate-600'
                  }`}>
                    {done ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                  </div>
                  <div className="min-w-0">
                    <div className={`text-xs font-bold truncate ${current ? 'text-white' : done ? 'text-slate-300' : 'text-slate-500'}`}>
                      {step.label}
                    </div>
                    <div className="text-[10px] text-slate-500">{step.sublabel}</div>
                  </div>
                  {current && <ChevronRight className="w-4 h-4 text-emerald-400 ml-auto shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Step Form */}
        <div className="lg:col-span-8">
          <div className="glass-panel p-5 flex flex-col gap-4 min-h-[400px] rounded-3xl border border-slate-700/70">
            {currentStep === 'PHONE' && (
              <>
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <h4 className="font-bold text-sm text-white">Step 1: Mobile Number Verification</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Enter the farmer's mobile number. In live mode, Supabase Auth sends a real SMS OTP; demo mode uses a local test code.
                </p>
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Full Name (as per land records)</label>
                    <input
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                      placeholder="Gurpreet Singh Brar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Mobile Number (+91)</label>
                    <input
                      type="tel"
                      maxLength={10}
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 font-mono"
                      placeholder="98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Village</label>
                      <input
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                        placeholder="Ubhawal"
                        value={village}
                        onChange={(e) => setVillage(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Block</label>
                      <select
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                        value={block}
                        onChange={(e) => setBlock(e.target.value)}
                      >
                        <option value="">Select Block</option>
                        <option>Sangrur</option>
                        <option>Sunam</option>
                        <option>Dhuri</option>
                        <option>Bhawanigarh</option>
                        <option>Dirba</option>
                        <option>Lehragaga</option>
                      </select>
                    </div>
                  </div>
                </div>
                <button
                  onClick={sendLiveOtp}
                  disabled={!phone || phone.length < 10 || !name || loading}
                  className="mt-auto w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow transition-all"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {DEMO_MODE ? 'Send Demo OTP' : 'Send OTP via SMS'}
                </button>
              </>
            )}

            {currentStep === 'OTP' && (
              <>
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <h4 className="font-bold text-sm text-white">Step 2: OTP Verification</h4>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 text-xs text-slate-300">
                  <div className="flex items-center justify-between gap-3">
                    <span>OTP sent to <strong className="text-white">+91 {phone}</strong> via SMS.</span>
                    <button type="button" onClick={() => { setCurrentStep('PHONE'); setOtp(''); setOtpError(''); }} className="shrink-0 text-amber-300 font-bold hover:text-amber-200">Edit</button>
                  </div>
                  {DEMO_MODE && <>
                    <br/>
                    <span className="text-emerald-400 font-semibold">Demo OTP: 8 4 2 6 1 3</span>
                  </>}
                </div>
                <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4">
                  <label className="text-sm font-bold text-slate-200 block mb-3">Enter 6-digit OTP</label>
                  <div className="flex gap-2 justify-center">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <input
                        key={i}
                        maxLength={1}
                        className={`w-10 h-12 rounded-lg text-center font-mono text-xl font-bold text-white focus:outline-none transition-all ${
                          otp[i]
                            ? 'bg-emerald-950/80 border-2 border-emerald-500'
                            : 'bg-slate-900 border border-slate-700 focus:border-emerald-500'
                        }`}
                        value={otp[i] || ''}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setOtp((prev) => {
                            const arr = prev.split('');
                            arr[i] = val;
                            return arr.join('').slice(0, 6);
                          });
                        }}
                      />
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-slate-500">Never share this code with anyone. NIRDHOOM will only use it to verify this phone.</p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <button type="button" disabled={resendSeconds > 0 || loading} onClick={sendLiveOtp} className="text-sm font-bold text-amber-300 disabled:text-slate-600">{resendSeconds > 0 ? `Resend OTP in ${resendSeconds}s` : 'Resend OTP'}</button>
                  <span className="text-xs text-slate-500">SMS verification</span>
                </div>
                <button
                  onClick={verifyLiveOtp}
                  disabled={(DEMO_MODE ? otp !== '842613' : otp.length !== 6) || loading}
                  className="mt-auto w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow transition-all"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {DEMO_MODE ? 'Verify Demo OTP & Continue' : 'Verify OTP & Continue'}
                </button>
                {otpError && <div className="text-xs text-red-300 bg-red-950/30 border border-red-500/30 rounded-lg p-2">{otpError}</div>}
              </>
            )}

            {currentStep === 'CONSENT' && (
              <>
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <h4 className="font-bold text-sm text-white">Step 3: Farmer consent</h4>
                </div>
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs text-slate-300 leading-relaxed">
                  NIRDHOOM may use your field, booking, machine-operation, evidence and residue-lot records to coordinate clearance and produce an auditable operational record. Identity-provider, bank and registry services are separate integrations and are not implied by this consent.
                </div>
                <label className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentAccepted}
                    onChange={(e) => setConsentAccepted(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-emerald-500"
                  />
                  <span className="text-xs text-slate-300">
                    I consent to the NIRDHOOM operational record workflow and understand that this prototype does not perform Aadhaar, biometric, bank or payment processing.
                  </span>
                </label>
                <button
                  onClick={async () => {
                    if (!consentAccepted) return;
                    if (DEMO_MODE) { advance(); return; }
                    if (!supabase) { setOtpError('Live authentication is not configured.'); return; }
                    setLoading(true);
                    setOtpError('');
                    const { data: userData } = await supabase.auth.getUser();
                    if (!userData.user) {
                      setLoading(false);
                      setOtpError('Your session expired. Please verify your phone again.');
                      return;
                    }
                    const { error: consentError } = await supabase.from('consents').insert({
                      profile_id: userData.user.id,
                      consent_type: 'farmer_network',
                      version: '2026-10-04',
                      source: 'WEB_OTP_ONBOARDING',
                    });
                    if (consentError) {
                      setLoading(false);
                      setOtpError(consentError.message || 'Consent could not be recorded.');
                      return;
                    }
                    const { error: profileError } = await supabase.from('profiles').update({ consent_status: 'GRANTED' }).eq('id', userData.user.id);
                    setLoading(false);
                    if (profileError) {
                      setOtpError(profileError.message || 'Consent was recorded but profile status could not be updated.');
                      return;
                    }
                    setCurrentStep('AADHAAR');
                  }}
                  disabled={!consentAccepted || loading}
                  className="mt-auto w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow transition-all"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                  {DEMO_MODE ? 'Accept demo consent' : 'Record consent & continue'}
                </button>
                {otpError && <div className="text-xs text-red-300 bg-red-950/30 border border-red-500/30 rounded-lg p-2">{otpError}</div>}
              </>
            )}

            {currentStep === 'AADHAAR' && (
              <>
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Fingerprint className="w-4 h-4 text-emerald-400" />
                  <h4 className="font-bold text-sm text-white">Step 3: Identity-provider adapter (demo)</h4>
                </div>
                <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-lg text-xs text-amber-200">
                  <strong>Demo consent screen:</strong> No UIDAI/Digilocker request is made by this prototype.
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Aadhaar last 4 digits (demo reference only)</label>
                  <input
                    type="text"
                    maxLength={4}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 font-mono tracking-widest"
                    placeholder="1234"
                    value={aadhaarLast4}
                    onChange={(e) => {
                      setAadhaarLast4(e.target.value.replace(/\D/g, '').slice(0, 4));
                    }}
                  />
                </div>
                <div className="flex items-start gap-2 text-xs text-slate-400 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Live identity verification requires an authorized identity provider. This prototype does not collect or store a full Aadhaar number; only a four-digit demo reference is accepted.</span>
                </div>
                <button
                  onClick={advance}
                  disabled={!DEMO_MODE || aadhaarLast4.length < 4 || loading}
                  className="mt-auto w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow transition-all"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Fingerprint className="w-4 h-4" />}
                  {DEMO_MODE ? 'Simulate identity-provider handoff' : 'Identity provider not configured'}
                </button>
              </>
            )}

            {currentStep === 'FACE_SCAN' && (
              <>
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Camera className="w-4 h-4 text-cyan-400" />
                  <h4 className="font-bold text-sm text-white">Step 4: Biometric provider adapter (demo)</h4>
                </div>
                <p className="text-xs text-slate-400">Demo-only biometric state. No face image is uploaded, matched, or scored by NIRDHOOM.</p>
                
                {!faceScanned ? (
                  <div
                    onClick={() => { setFaceScanned(true); }}
                    className="flex-1 min-h-[200px] rounded-2xl border-2 border-dashed border-slate-700 hover:border-emerald-500/60 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all group bg-slate-900/50"
                  >
                    <div className="w-24 h-24 rounded-full border-2 border-slate-600 group-hover:border-emerald-500/60 flex items-center justify-center bg-slate-800 transition-all">
                      <Camera className="w-10 h-10 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                    </div>
                    <div className="text-xs text-slate-400 text-center">
                      <div className="font-semibold text-white">Click to simulate selfie capture</div>
                      <div>Position face in the oval frame</div>
                    </div>
                    <div className="flex gap-2 text-[10px] text-slate-500">
                      <span>• Look straight</span>
                      <span>• Good lighting</span>
                      <span>• No glasses</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 min-h-[220px] rounded-2xl bg-emerald-950/40 border border-emerald-500/50 flex flex-col items-center justify-center gap-3 p-3">
                    <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-emerald-400 shadow-lg shadow-emerald-500/30">
                      <img 
                        src="/images/farmer_gurpreet.jpg" 
                        alt="Farmer Verified Selfie" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none" />
                      <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-[#03060f]">
                        <CheckCircle2 className="w-4 h-4 text-slate-950 font-bold" />
                      </div>
                    </div>
                    <div className="text-center text-xs">
                      <div className="font-bold text-emerald-400 text-sm">Demo biometric state ✓</div>
                      <div className="text-slate-300 mt-0.5">No external identity match was performed</div>
                      <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 font-mono">
                        Liveness: Active Pulse Detected
                      </span>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={advance}
                  disabled={!DEMO_MODE || !faceScanned || loading}
                  className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow transition-all"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {DEMO_MODE ? 'Confirm demo biometric state' : 'Biometric provider not configured'}
                </button>
              </>
            )}

            {currentStep === 'BANK' && (
              <>
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Landmark className="w-4 h-4 text-amber-400" />
                  <h4 className="font-bold text-sm text-white">Step 5: Bank details (demo)</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Bank and payment-provider verification are not connected in this release. We do not ask for a real UPI ID or bank account here.
                </p>
                {!bankVerified ? (
                  <button
                    onClick={() => { if (DEMO_MODE) setBankVerified(true); }}
                    disabled={!DEMO_MODE || loading}
                    className="py-2.5 rounded-lg bg-amber-600/80 hover:bg-amber-500 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow transition-all"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    {DEMO_MODE ? 'Mark demo bank step complete' : 'Bank provider not configured'}
                  </button>
                ) : (
                  <div className="p-3 bg-emerald-950/50 border border-emerald-500/40 rounded-lg text-sm text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Demo bank step complete — no financial details were collected and no transaction was performed.
                  </div>
                )}
                <button
                  onClick={advance}
                  disabled={!DEMO_MODE || !bankVerified || loading}
                  className="mt-auto w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow transition-all"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                  {DEMO_MODE ? 'Continue' : 'Bank verification unavailable'}
                </button>
              </>
            )}

            {currentStep === 'LAND_RECORDS' && (
              <>
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Wheat className="w-4 h-4 text-emerald-400" />
                  <h4 className="font-bold text-sm text-white">Step 6: Land Record & Khasra Linking</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">Nirdhoom links Fasal Bima (PMFBY) Khasra records to auto-populate field polygon. The farmer simply confirms their Khasra number from the village patwari register.</p>
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Khasra / Survey Number</label>
                    <input
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 font-mono"
                      placeholder="412/1-2"
                      value={khasra}
                      onChange={(e) => setKhasra(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Acreage (acres)</label>
                    <input
                      type="number"
                      min={0.5}
                      max={50}
                      step={0.5}
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 font-mono"
                      placeholder="3.5"
                      value={acreage}
                      onChange={(e) => setAcreage(e.target.value)}
                    />
                  </div>
                  <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 text-xs text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 inline mr-1.5" />
                    {DEMO_MODE ? 'Demo polygon placeholder only; no authoritative land record is queried.' : 'Live mode requires an authorized Punjab land-records data feed before a field can be created.'}
                  </div>
                </div>
                <button
                  onClick={advance}
                  disabled={!DEMO_MODE || !khasra || !acreage || loading}
                  className="mt-auto w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow transition-all"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                  {DEMO_MODE ? 'Simulate land-record link' : 'Official cadastral provider required'}
                </button>
              </>
            )}

            {currentStep === 'DONE' && (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 py-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-emerald-400 shadow-xl shadow-emerald-500/20">
                    <img 
                      src="/images/farmer_gurpreet.jpg" 
                      alt="Gurpreet Singh Brar" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 border-2 border-[#03060f] flex items-center justify-center shadow">
                    <CheckCircle2 className="w-5 h-5 text-slate-950 font-black" />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-emerald-400 font-['Outfit']">ਗੁਰਪ੍ਰੀਤ ਸਿੰਘ ਰਜਿਸਟਰ ਹੋ ਗਏ!</div>
                  <p className="text-white font-bold mt-1">{name || 'Gurpreet Singh Brar'} is now registered on Nirdhoom!</p>
                  <p className="text-xs text-slate-300 mt-1 max-w-sm">
                    Demo profile created · OTP verified · Khasra {khasra || '412/1-2'} ({acreage || '3.5'} ac) Mapped
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 w-full max-w-sm text-xs">
                  {[
                    { label: 'Farmer ID', value: `NRD-FMR-${Date.now().toString().slice(-6)}` },
                    { label: 'Phone verified', value: `+91 ${phone || '••••••••••'}` },
                    { label: 'Khasra', value: khasra || '412/1-2' },
                    { label: 'Acreage', value: `${acreage || '3.5'} acres` },
                  ].map((item) => (
                    <div key={item.label} className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5">
                      <div className="text-slate-400 text-[10px] uppercase font-bold">{item.label}</div>
                      <div className="text-white font-mono text-xs mt-0.5 truncate">{item.value}</div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={reset}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer transition-all"
                >
                  Register Another Farmer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};