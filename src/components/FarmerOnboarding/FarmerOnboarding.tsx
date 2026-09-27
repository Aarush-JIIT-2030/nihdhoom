import React, { useState } from 'react';
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
  IndianRupee,
  Loader2,
} from 'lucide-react';

type KYCStep = 'PHONE' | 'OTP' | 'AADHAAR' | 'FACE_SCAN' | 'BANK' | 'LAND_RECORDS' | 'DONE';

const STEPS: { id: KYCStep; label: string; sublabel: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'PHONE', label: 'Mobile Verification', sublabel: 'Enter registered mobile', icon: Phone },
  { id: 'OTP', label: 'OTP Confirm', sublabel: '6-digit SMS code', icon: Smartphone },
  { id: 'AADHAAR', label: 'Aadhaar eKYC', sublabel: 'Digilocker consent flow', icon: Fingerprint },
  { id: 'FACE_SCAN', label: 'Live Selfie Match', sublabel: 'Aadhaar photo match', icon: Camera },
  { id: 'BANK', label: 'UPI / Bank Link', sublabel: 'Penny drop verification', icon: Landmark },
  { id: 'LAND_RECORDS', label: 'Land Records', sublabel: 'Fasal Bima Khasra link', icon: Wheat },
  { id: 'DONE', label: 'Farmer Registered!', sublabel: 'Ready for dispatch', icon: CheckCircle2 },
];

const STEP_ORDER: KYCStep[] = ['PHONE', 'OTP', 'AADHAAR', 'FACE_SCAN', 'BANK', 'LAND_RECORDS', 'DONE'];

export const FarmerOnboarding: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<KYCStep>('PHONE');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [aadhaarNo, setAadhaarNo] = useState('');
  const [name, setName] = useState('');
  const [village, setVillage] = useState('');
  const [block, setBlock] = useState('');
  const [upiId, setUpiId] = useState('');
  const [khasra, setKhasra] = useState('');
  const [acreage, setAcreage] = useState('');
  const [loading, setLoading] = useState(false);
  const [faceScanned, setFaceScanned] = useState(false);
  const [bankVerified, setBankVerified] = useState(false);

  const stepIndex = STEP_ORDER.indexOf(currentStep);

  const advance = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const next = STEP_ORDER[stepIndex + 1];
      if (next) setCurrentStep(next);
    }, 900);
  };

  const reset = () => {
    setCurrentStep('PHONE');
    setPhone(''); setOtp(''); setAadhaarNo(''); setName(''); setVillage('');
    setBlock(''); setUpiId(''); setKhasra(''); setAcreage('');
    setFaceScanned(false); setBankVerified(false);
  };

  const isComplete = (step: KYCStep) => STEP_ORDER.indexOf(step) < stepIndex;
  const isCurrent = (step: KYCStep) => step === currentStep;

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto p-2">
      {/* Banner */}
      <div className="glass-panel-emerald p-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-lg text-white font-['Outfit']">
                Farmer KYC & Onboarding Flow
              </h3>
              <span className="badge badge-emerald text-xs">Aadhaar eKYC</span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              A fully digital zero-paper onboarding: mobile OTP → Aadhaar Digilocker → live selfie → UPI penny-drop → Fasal Bima land record link. Farmers are registered in under 4 minutes.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Steps Sidebar */}
        <div className="lg:col-span-4">
          <div className="glass-panel p-4 flex flex-col gap-1.5">
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
          <div className="glass-panel p-5 flex flex-col gap-4 min-h-[400px]">
            {currentStep === 'PHONE' && (
              <>
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <h4 className="font-bold text-sm text-white">Step 1: Mobile Number Verification</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Enter the farmer's registered mobile number. An OTP will be dispatched via SMS and WhatsApp. No app download required.
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
                  onClick={advance}
                  disabled={!phone || phone.length < 10 || !name || loading}
                  className="mt-auto w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow transition-all"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Send OTP via SMS + WhatsApp
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
                  OTP sent to <strong className="text-white">+91 {phone}</strong> via SMS & WhatsApp.
                  <br/>
                  <span className="text-emerald-400 font-semibold">Demo OTP: 8 4 2 6 1 3</span>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-2">Enter 6-digit OTP</label>
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
                </div>
                <button
                  onClick={advance}
                  disabled={otp !== '842613' || loading}
                  className="mt-auto w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow transition-all"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Verify OTP & Continue
                </button>
              </>
            )}

            {currentStep === 'AADHAAR' && (
              <>
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Fingerprint className="w-4 h-4 text-emerald-400" />
                  <h4 className="font-bold text-sm text-white">Step 3: Aadhaar eKYC via Digilocker</h4>
                </div>
                <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-lg text-xs text-amber-200">
                  <strong>Consent required:</strong> "I authorize Nirdhoom to fetch my Aadhaar-linked demographic details from UIDAI for KYC verification under PMFBY framework."
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Aadhaar Number (12-digit)</label>
                  <input
                    type="text"
                    maxLength={14}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 font-mono tracking-widest"
                    placeholder="XXXX XXXX XXXX"
                    value={aadhaarNo}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 12);
                      setAadhaarNo(val.replace(/(\d{4})(?=\d)/g, '$1 ').trim());
                    }}
                  />
                </div>
                <div className="flex items-start gap-2 text-xs text-slate-400 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Aadhaar data is tokenised. Only the last 4 digits + demographic match is stored. Raw UID is never persisted per UIDAI guidelines.</span>
                </div>
                <button
                  onClick={advance}
                  disabled={aadhaarNo.replace(/\s/g, '').length < 12 || loading}
                  className="mt-auto w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow transition-all"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Fingerprint className="w-4 h-4" />}
                  Launch Digilocker Consent
                </button>
              </>
            )}

            {currentStep === 'FACE_SCAN' && (
              <>
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Camera className="w-4 h-4 text-cyan-400" />
                  <h4 className="font-bold text-sm text-white">Step 4: Live Selfie Face Match</h4>
                </div>
                <p className="text-xs text-slate-400">AI liveness detection ensures no photo spoofing. The selfie is matched against the Aadhaar UIDAI photo using a cosine similarity threshold of ≥ 0.82.</p>
                
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
                      <div className="font-bold text-emerald-400 text-sm">Face Match: 98.4% Confidence ✓</div>
                      <div className="text-slate-300 mt-0.5">UIDAI Demographic &amp; Iris/Photo Match Verified</div>
                      <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 font-mono">
                        Liveness: Active Pulse Detected
                      </span>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={advance}
                  disabled={!faceScanned || loading}
                  className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow transition-all"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Confirm Biometric Match
                </button>
              </>
            )}

            {currentStep === 'BANK' && (
              <>
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Landmark className="w-4 h-4 text-amber-400" />
                  <h4 className="font-bold text-sm text-white">Step 5: UPI / Bank Account Linking</h4>
                </div>
                <p className="text-xs text-slate-400">Enter UPI VPA or bank account. A ₹1 penny-drop is fired via RazorpayX to verify account ownership, then reversed within 60s.</p>
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">UPI ID (Preferred)</label>
                    <input
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 font-mono"
                      placeholder="gurpreet.brar@oksbi"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                    />
                  </div>
                  {!bankVerified ? (
                    <button
                      onClick={() => { setBankVerified(true); }}
                      disabled={!upiId || loading}
                      className="py-2 rounded-lg bg-amber-600/80 hover:bg-amber-500 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow transition-all"
                    >
                      <IndianRupee className="w-3.5 h-3.5" />
                      Fire ₹1 Penny Drop via RazorpayX
                    </button>
                  ) : (
                    <div className="p-2.5 bg-emerald-950/50 border border-emerald-500/40 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Bank account verified: {upiId} · ₹1 credited & reversed
                    </div>
                  )}
                </div>
                <button
                  onClick={advance}
                  disabled={!bankVerified || loading}
                  className="mt-auto w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow transition-all"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                  Confirm Bank Linking
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
                    Field polygon auto-generated from Khasra coordinates. Farmer can adjust boundary on next screen.
                  </div>
                </div>
                <button
                  onClick={advance}
                  disabled={!khasra || !acreage || loading}
                  className="mt-auto w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow transition-all"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                  Link Land Records & Complete Onboarding
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
                    Verified Punjab Farmer Profile · WhatsApp IVR Enrolled · UPI Linked · Khasra {khasra || '412/1-2'} ({acreage || '3.5'} ac) Mapped
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 w-full max-w-sm text-xs">
                  {[
                    { label: 'Farmer ID', value: `NRD-FMR-${Date.now().toString().slice(-6)}` },
                    { label: 'UPI VPA', value: upiId || 'gurpreet.brar@oksbi' },
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
