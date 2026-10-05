export interface ChatMessage {
  id: string;
  sender: 'farmer' | 'bot' | 'system';
  text: string;
  textPunjabi?: string;
  time: string;
  hasVoiceNote?: boolean;
  voiceNoteDuration?: string;
  voiceNoteScript?: string;
  hasInteractiveCard?: 'SLOT_GUARANTEE' | 'UPI_RECEIPT' | 'VARIETY_SELECTOR';
  metadata?: Record<string, unknown>;
}

export const INITIAL_CHAT_HISTORY: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'farmer',
    text: 'Sat Sri Akal ji! Ubhawal to Gurpreet Singh bol reha haan. Mainu 3.5 acre PR-126 khet di parali chukwaani hai.',
    textPunjabi: 'ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ ਜੀ! ਉਭਾਵਾਲ ਤੋਂ ਗੁਰਪ੍ਰੀਤ ਸਿੰਘ ਬੋਲ ਰਿਹਾ ਹਾਂ। ਮੈਨੂੰ 3.5 ਏਕੜ ਪੀਆਰ-126 ਖੇਤ ਦੀ ਪਰਾਲੀ ਚੁਕਵਾਣੀ ਹੈ।',
    time: '10:41 AM',
    hasVoiceNote: true,
    voiceNoteDuration: '0:14',
    voiceNoteScript: 'Sat Sri Akal ji, main Ubhawal to Gurpreet Singh bol reha haan. Mainu saade tin acre PR-126 khet di parali chukwaani hai, wheat bijn da time aa reha hai.',
  },
  {
    id: 'msg-2',
    sender: 'bot',
    text: 'Sat Sri Akal Gurpreet ji! Nirdhoom Stubble Dispatch Network vich swagat hai. Tuhada field polygon (Khasra 412/1-2, Ubhawal, Sangrur) satellite te locate ho gaya hai.',
    textPunjabi: 'ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ ਗੁਰਪ੍ਰੀਤ ਜੀ! ਨਿਰਧੂਮ ਡਿਸਪੈਚ ਨੈੱਟਵਰਕ ਵਿੱਚ ਸਵਾਗਤ ਹੈ। ਤੁਹਾਡਾ ਖੇਤ ਪੋਲੀਗਨ (ਖਸਰਾ 412/1-2) ਸੈਟੇਲਾਈਟ ਤੇ ਲੱਭ ਲਿਆ ਗਿਆ ਹੈ।',
    time: '10:41 AM',
  },
  {
    id: 'msg-3',
    sender: 'bot',
    text: 'Tuhade layi estimated clearance window te server-calculated indicative price tayar hai. Early booking naal planning priority mil sakdi hai.',
    textPunjabi: 'ਤੁਹਾਡੇ ਲਈ ਅੰਦਾਜ਼ੀ ਕਲੀਅਰੈਂਸ ਵਿੰਡੋ ਅਤੇ ਇੰਡਿਕੇਟਿਵ ਰੇਟ ਤਿਆਰ ਹੈ। ਪਹਿਲਾਂ ਬੁੱਕ ਕਰਨ ਨਾਲ ਪਲੈਨਿੰਗ ਪ੍ਰਾਇਰਟੀ ਮਿਲ ਸਕਦੀ ਹੈ।',
    time: '10:42 AM',
        hasVoiceNote: true,
    voiceNoteDuration: '0:22',
    voiceNoteScript: 'Gurpreet ji, tuhade khet layi 16 October shaam da ik estimated clearance window dikh reha hai. Booking confirm hon ton baad NIRDHOOM tuhanu machine da status dassega. Payment is release vich connected nahi hai.',
  },
];
