import React, { useState } from 'react';
import { 
  Send, 
  Mic, 
  Phone, 
  Video, 
  MoreVertical, 
  CheckCheck, 
  Play, 
  Square, 
  ShieldCheck, 
  Sparkles, 
  Calendar, 
  CreditCard,
  Volume2,
  Sliders,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { INITIAL_CHAT_HISTORY, ChatMessage } from '../../data/punjabiTranslations';
import { calculateDynamicQuote } from '../../utils/dynamicPricing';
import { audioSynth } from '../../utils/audioSynth';
import { Field } from '../../types';

interface WhatsAppSimulatorProps {
  onSlotConfirmed?: (fieldId: string) => void;
  onOpenUpiSettlement?: () => void;
}

export const WhatsAppSimulator: React.FC<WhatsAppSimulatorProps> = ({
  onSlotConfirmed,
  onOpenUpiSettlement,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_HISTORY);
  const [inputText, setInputText] = useState('');
  const [isPlayingAudioId, setIsPlayingAudioId] = useState<string | null>(null);
  const [daysEarly, setDaysEarly] = useState<number>(18);
  const [acreage] = useState<number>(3.5);
  const [isSlotLocked, setIsSlotLocked] = useState(false);
  const [langPreference, setLangPreference] = useState<'pa' | 'en'>('pa');
  const [farmerRating, setFarmerRating] = useState<number>(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [ivrActive, setIvrActive] = useState(false);
  const [ivrStep, setIvrStep] = useState(0);

  const dynamicQuote = calculateDynamicQuote(acreage, daysEarly);

  const handlePlayVoiceNote = (msg: ChatMessage) => {
    if (isPlayingAudioId === msg.id) {
      audioSynth.stopAllSpeech();
      setIsPlayingAudioId(null);
    } else {
      setIsPlayingAudioId(msg.id);
      const textToSpeak = msg.voiceNoteScript || msg.text;
      audioSynth.speakPunjabiVoiceNote(textToSpeak, () => {
        setIsPlayingAudioId(null);
      });
    }
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'farmer',
      text: text,
      textPunjabi: text,
      time: '10:43 AM',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // Simulate instant intelligent bot response
    setTimeout(() => {
      const botReply: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'bot',
        text: 'Dhanvaad! Tuhadi request Punjab Central Dispatch engine nu bhej ditti gayi hai. Baler #14 allocate ho chukka hai.',
        textPunjabi: 'ਧੰਨਵਾਦ! ਤੁਹਾਡੀ ਰਿਕਵੈਸਟ ਪੰਜਾਬ ਸੈਂਟਰਲ ਡਿਸਪੈਚ ਇੰਜਣ ਨੂੰ ਭੇਜ ਦਿੱਤੀ ਗਈ ਹੈ। ਬੇਲਰ #14 ਐਲੋਕੇਟ ਹੋ ਚੁੱਕਾ ਹੈ।',
        time: '10:43 AM',
        hasInteractiveCard: 'SLOT_GUARANTEE',
      };
      setMessages((prev) => [...prev, botReply]);
    }, 700);
  };

  const handleConfirmSlot = () => {
    setIsSlotLocked(true);
    const confirmationMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'bot',
      text: `SLOT CONFIRMED! Khasra 412/1 is contracted for clearance by 16 Oct. Guaranteed rate locked at ₹${dynamicQuote.ratePerAcre}/acre. Penalty obligation of ₹${dynamicQuote.penaltyCoverage} activated.`,
      textPunjabi: `ਸਲਾਟ ਕੰਨਫਰਮ ਹੋ ਗਿਆ! ਖਸਰਾ 412/1 ਲਈ 16 ਅਕਤੂਬਰ ਤੱਕ ਕਲੀਅਰੈਂਸ ਪੱਕੀ ਹੈ। ਲਾਕਡ ਰੇਟ: ₹${dynamicQuote.ratePerAcre}/ਏਕੜ। ਪੈਨਲਟੀ ਗਾਰੰਟੀ: ₹${dynamicQuote.penaltyCoverage} ਐਕਟਿਵ।`,
      time: '10:44 AM',
      hasVoiceNote: true,
      voiceNoteDuration: '0:18',
      voiceNoteScript: `Mubarakbaad Gurpreet ji! Tuhada slot pakka book ho gaya hai. 16 October nu baler pahuchega. Tuhade UPI khate vich 5075 rupaye khet clear hunde hi 90 second vich transfer ho jaange.`,
    };
    setMessages((prev) => [...prev, confirmationMsg]);
    if (onSlotConfirmed) {
      onSlotConfirmed('FIELD-101');
    }
    // Show rating card after 3s
    setTimeout(() => {
      const ratingMsg: ChatMessage = {
        id: `msg-${Date.now() + 2}`,
        sender: 'bot',
        text: 'Gurpreet ji, aapki service kaisi lagi? Plz rate karo (1-5 ⭐). Tuhada feedback sade network improve karda hai!',
        textPunjabi: 'ਗੁਰਪ੍ਰੀਤ ਜੀ, ਸਾਡੀ ਸੇਵਾ ਕਿਵੇਂ ਲੱਗੀ? ਕਿਰਪਾ ਕਰਕੇ ਰੇਟਿੰਗ ਦਿਓ (1-5 ⭐). ਤੁਹਾਡਾ ਫੀਡਬੈਕ ਸਾਡੇ ਨੈੱਟਵਰਕ ਨੂੰ ਬਿਹਤਰ ਬਣਾਉਂਦਾ ਹੈ!',
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        hasInteractiveCard: 'UPI_RECEIPT',
      };
      setMessages((prev) => [...prev, ratingMsg]);
    }, 3500);
  };

  const handleIVRCall = () => {
    setIvrActive(true);
    setIvrStep(0);
    audioSynth.speakPunjabiVoiceNote(
      'Sat Sri Akal. Nirdhoom Punjab dispatch seva vich aapda swagat hai. Parali pickup book karan layi 1 dabao.',
      () => setIvrStep(1)
    );
  };

  const handleIVRKeypress = (key: string) => {
    if (key === '1' && ivrStep === 1) {
      setIvrStep(2);
      audioSynth.speakPunjabiVoiceNote(
        'Shukriya. Tuhada slot October 16 layi confirm ho gaya. Baler number 14 tuhade khet pahuchega.',
        () => { setIvrStep(3); setTimeout(() => setIvrActive(false), 2000); }
      );
    }
  };
  return (
    <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 p-2 max-w-6xl mx-auto">
      {/* Left side: Explanatory Context for Judges */}
      <div className="w-full lg:w-5/12 flex flex-col gap-4">
        <div className="glass-panel-emerald p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base text-white">
              Beat 1: Farmer WhatsApp & Parametric Guarantee
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Punjab farmers do not install complex smartphone apps. WhatsApp Cloud API + IVR is the real farmer surface. Here, the farmer interacts in Punjabi, books a pickup, and receives an <strong>instant slot guarantee backed by a late penalty</strong>.
          </p>

          <div className="mt-3 pt-3 border-t border-emerald-500/20 flex items-center justify-between text-xs">
            <span className="text-slate-400">Language view:</span>
            <div className="flex gap-1">
              <button
                onClick={() => setLangPreference('pa')}
                className={`px-2 py-1 rounded text-xs font-semibold cursor-pointer ${
                  langPreference === 'pa' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                ਪੰਜਾਬੀ (Punjabi)
              </button>
              <button
                onClick={() => setLangPreference('en')}
                className={`px-2 py-1 rounded text-xs font-semibold cursor-pointer ${
                  langPreference === 'en' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* Real Punjab Farmer Profile Card */}
          <div className="mt-3 bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
            <img 
              src="/images/farmer_gurpreet.jpg" 
              alt="Gurpreet Singh Brar" 
              className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500/50 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white truncate">Gurpreet Singh Brar</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                  Ubhawal, Sangrur
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                <span>3.5 Acres • PR-126 Paddy</span>
                <span>•</span>
                <span className="text-emerald-400 font-mono">gurpreet.brar@oksbi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Pricing Interactive Demonstration Slider */}
        <div className="glass-panel p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <h4 className="font-bold text-sm text-white">Wedge 3: Airline Dynamic Pricing</h4>
            </div>
            <span className="badge badge-amber text-[10px]">
              {dynamicQuote.tierName.split(' ')[0]}
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Yield-managing the 30-day spike: Register 3 weeks pre-harvest for the top rate. Walk-in day-of gets floor rate.
          </p>

          <div className="space-y-2 bg-slate-900/90 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Days booked pre-harvest:</span>
              <span className="font-bold text-emerald-400 font-mono text-sm">{daysEarly} Days Prior</span>
            </div>
            <input
              type="range"
              min="1"
              max="28"
              value={daysEarly}
              onChange={(e) => setDaysEarly(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Day 1 (₹750/ac floor)</span>
              <span>Day 14 (₹1,300/ac)</span>
              <span>Day 21+ (₹1,450/ac top)</span>
            </div>
          </div>

          {/* Dynamic Rates Display */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Locked Rate / Acre</span>
              <span className="text-base font-extrabold text-white font-mono">
                ₹{dynamicQuote.ratePerAcre}
              </span>
              <span className="text-emerald-400 text-[10px] block font-semibold">
                +{dynamicQuote.urgencyDiscountOrBonusPct}% Early Bonus
              </span>
            </div>

            <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Total Settle (3.5 ac)</span>
              <span className="text-base font-extrabold text-emerald-400 font-mono">
                ₹{(dynamicQuote.ratePerAcre * 3.5).toLocaleString()}
              </span>
              <span className="text-slate-400 text-[10px] block">&lt;90s via UPI</span>
            </div>
          </div>

          <div className="bg-amber-950/40 p-2.5 rounded border border-amber-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <div>
                <span className="font-bold text-amber-200 block">Parametric Penalty Backing</span>
                <span className="text-[11px] text-slate-300">If delayed &gt;48h: ₹{dynamicQuote.penaltyCoverage} paid to UPI</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: WhatsApp Smartphone Device UI */}
      <div className="w-full lg:w-7/12 flex justify-center">
        <div className="device-frame">
          {/* Phone Status Bar */}
          <div className="device-header">
            <span>10:44 AM</span>
            <div className="device-notch"></div>
            <div className="flex items-center gap-1.5 text-xs">
              <span>5G</span>
              <span>84%</span>
            </div>
          </div>

          {/* WhatsApp Chat App Header */}
          <div className="bg-emerald-950/90 border-b border-emerald-800/60 p-2.5 flex items-center justify-between text-white shadow">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white shadow">
                ਨਿ
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm">Nirdhoom Punjab</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                </div>
                <div className="text-[11px] text-emerald-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Verified CRM Dispatcher • Online</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-300">
              <Phone className="w-4 h-4 cursor-pointer hover:text-white" />
              <Video className="w-4 h-4 cursor-pointer hover:text-white" />
              <MoreVertical className="w-4 h-4 cursor-pointer hover:text-white" />
            </div>
          </div>

          {/* WhatsApp Chat Messages Stream */}
          <div className="p-3 overflow-y-auto flex flex-col gap-3 min-h-[440px] max-h-[460px] bg-[#070b12] text-xs">
            {messages.map((msg) => {
              const isFarmer = msg.sender === 'farmer';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[85%] ${
                    isFarmer ? 'self-end items-end' : 'self-start items-start'
                  }`}
                >
                  <div
                    className={`p-3 rounded-2xl shadow ${
                      isFarmer
                        ? 'bg-emerald-700 text-white rounded-tr-none'
                        : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none'
                    }`}
                  >
                    {/* Voice Note Player Pill if message has audio */}
                    {msg.hasVoiceNote && (
                      <div className="mb-2 bg-black/30 p-2 rounded-xl flex items-center gap-2.5 border border-white/10">
                        <button
                          onClick={() => handlePlayVoiceNote(msg)}
                          className="w-7 h-7 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center cursor-pointer shadow"
                          title="Listen to Punjabi Voice Note"
                        >
                          {isPlayingAudioId === msg.id ? (
                            <Square className="w-3.5 h-3.5 fill-current" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          )}
                        </button>

                        {/* Animated waveform bars */}
                        <div className="flex items-center gap-1 h-5 flex-1">
                          <div className={`wave-bar ${isPlayingAudioId === msg.id ? '' : 'h-1'}`} />
                          <div className={`wave-bar ${isPlayingAudioId === msg.id ? '' : 'h-1'}`} />
                          <div className={`wave-bar ${isPlayingAudioId === msg.id ? '' : 'h-1'}`} />
                          <div className={`wave-bar ${isPlayingAudioId === msg.id ? '' : 'h-1'}`} />
                          <div className={`wave-bar ${isPlayingAudioId === msg.id ? '' : 'h-1'}`} />
                          <div className={`wave-bar ${isPlayingAudioId === msg.id ? '' : 'h-1'}`} />
                        </div>

                        <span className="text-[10px] font-mono text-emerald-300">
                          {msg.voiceNoteDuration}
                        </span>
                      </div>
                    )}

                    {/* Text in Punjabi / English */}
                    <p className="leading-relaxed">
                      {langPreference === 'pa' && msg.textPunjabi
                        ? msg.textPunjabi
                        : msg.text}
                    </p>

                    {/* UPI Receipt / Rating Card */}
                    {msg.hasInteractiveCard === 'UPI_RECEIPT' && !ratingSubmitted && (
                      <div className="mt-2.5 p-2.5 bg-slate-950/80 rounded-xl border border-amber-500/40 text-[11px] flex flex-col gap-2">
                        <div className="text-amber-300 font-bold text-xs">⭐ Rate Your Experience</div>
                        <div className="flex items-center gap-1.5 justify-center">
                          {[1,2,3,4,5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setFarmerRating(star)}
                              className={`text-2xl cursor-pointer transition-transform hover:scale-125 ${star <= farmerRating ? 'text-amber-400' : 'text-slate-600'}`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                        {farmerRating > 0 && (
                          <button
                            onClick={() => setRatingSubmitted(true)}
                            className="w-full py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
                          >
                            Submit {farmerRating}★ Rating
                          </button>
                        )}
                      </div>
                    )}
                    {msg.hasInteractiveCard === 'UPI_RECEIPT' && ratingSubmitted && (
                      <div className="mt-2 text-center text-emerald-400 font-bold text-xs">✓ {farmerRating}★ rating received. Dhanyavaad!</div>
                    )}


                    {/* Interactive Slot Guarantee Card inside Bot Message */}
                    {msg.hasInteractiveCard === 'SLOT_GUARANTEE' && (
                      <div className="mt-2.5 p-2.5 bg-slate-950/80 rounded-xl border border-emerald-500/40 text-[11px] flex flex-col gap-2">
                        <div className="flex items-center justify-between font-bold border-b border-slate-800 pb-1.5 text-white">
                          <span className="flex items-center gap-1 text-emerald-400">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>GUARANTEED SLOT CONTRACT</span>
                          </span>
                          <span className="text-amber-400 font-mono">OCT 16, 2026</span>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 text-slate-300">
                          <div>Khasra: <strong>412/1-2</strong></div>
                          <div>Acreage: <strong>3.5 Acres</strong></div>
                          <div>Variety: <strong>PR-126 (Paddy)</strong></div>
                          <div>Window: <strong>48 Hours Max</strong></div>
                        </div>

                        <div className="bg-emerald-950/60 p-2 rounded border border-emerald-500/30 flex justify-between items-center text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Locked Dynamic Rate</span>
                            <span className="font-extrabold text-emerald-300 font-mono">
                              ₹{dynamicQuote.ratePerAcre}/acre
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block">Total Payout</span>
                            <span className="font-extrabold text-white font-mono">
                              ₹{(dynamicQuote.ratePerAcre * 3.5).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="text-[10px] text-amber-300 flex items-center gap-1 font-semibold">
                          <span>⚖️ Penalty Guarantee:</span>
                          <span>₹{dynamicQuote.penaltyCoverage} sent via UPI if baler is late!</span>
                        </div>

                        {!isSlotLocked ? (
                          <button
                            onClick={handleConfirmSlot}
                            className="mt-1 w-full py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow cursor-pointer transition-all flex items-center justify-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Lock Slot &amp; Contract Guarantee</span>
                          </button>
                        ) : (
                          <div className="mt-1 w-full py-1.5 rounded-lg bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 text-center font-bold text-xs flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Slot &amp; Rate Locked Successfully</span>
                          </div>
                        )}
                      </div>
                    )}



                    <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-slate-400">
                      <span>{msg.time}</span>
                      {isFarmer && <CheckCheck className="w-3 h-3 text-cyan-300" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Reply Chips Bar */}
          <div className="bg-slate-900 border-t border-slate-800 p-1.5 flex gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
            <button
              onClick={() => handleSendMessage('Mainu slot pakka chahida hai.')}
              className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 whitespace-nowrap cursor-pointer"
            >
              ✅ Confirm Slot
            </button>
            <button
              onClick={() => handleSendMessage('Late penalty kiven aavegi?')}
              className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 whitespace-nowrap cursor-pointer"
            >
              ⚖️ Penalty details?
            </button>
            <button
              onClick={() => handleSendMessage('UPI paise kado milange?')}
              className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 whitespace-nowrap cursor-pointer"
            >
              💸 UPI settlement?
            </button>
            <button
              onClick={() => handleSendMessage('PR-126 variety hai mera khet.')}
              className="px-2.5 py-1 rounded-full bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 border border-emerald-700 whitespace-nowrap cursor-pointer"
            >
              🌾 PR-126 Variety
            </button>
            <button
              onClick={handleIVRCall}
              className="px-2.5 py-1 rounded-full bg-amber-900/60 hover:bg-amber-800 text-amber-300 border border-amber-700 whitespace-nowrap cursor-pointer flex items-center gap-1"
            >
              📞 Simulate IVR Call
            </button>
          </div>

          {/* IVR Call Overlay */}
          {ivrActive && (
            <div className="absolute inset-0 z-20 bg-slate-950/95 backdrop-blur-sm flex flex-col items-center justify-center gap-4 rounded-b-[32px]">
              <div className="w-20 h-20 rounded-full bg-emerald-600/20 border-2 border-emerald-500 flex items-center justify-center animate-pulse">
                <span className="text-4xl">📞</span>
              </div>
              <div className="text-center">
                <div className="font-black text-white text-base font-['Outfit']">Nirdhoom IVR Helpline</div>
                <div className="text-emerald-400 text-xs mt-0.5">+91 1800-XXX-XXXX · Free call</div>
              </div>
              <div className="text-center text-xs text-slate-300 max-w-[240px] leading-relaxed px-4">
                {ivrStep === 0 && '📻 "Sat Sri Akal. Nirdhoom Punjab dispatch seva vich swagat..."'}
                {ivrStep === 1 && '📻 Slot book karan layi 1 dabao...'}
                {ivrStep === 2 && '✅ Slot confirmed! October 16 layi baler dispatch ho gaya.'}
                {ivrStep === 3 && '✅ Call complete. Disconnecting...'}
              </div>
              {ivrStep === 1 && (
                <div className="flex gap-3">
                  {['1','2','3','*'].map((k) => (
                    <button
                      key={k}
                      onClick={() => handleIVRKeypress(k)}
                      className="w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg cursor-pointer border border-slate-700"
                    >
                      {k}
                    </button>
                  ))}
                </div>
              )}
              <button
                onClick={() => { setIvrActive(false); audioSynth.stopAllSpeech(); }}
                className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer"
              >
                📵 End Call
              </button>
            </div>
          )}


          {/* Chat Input Bar */}
          <div className="bg-slate-950 p-2 flex items-center gap-2 border-t border-slate-800">
            <div className="flex-1 bg-slate-900 rounded-full px-3.5 py-1.5 text-xs text-slate-200 flex items-center border border-slate-800">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Punjabi / English vich likho..."
                className="w-full bg-transparent outline-none text-xs text-white"
              />
            </div>
            <button
              onClick={() => handleSendMessage()}
              className="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center cursor-pointer shadow"
            >
              <Send className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
