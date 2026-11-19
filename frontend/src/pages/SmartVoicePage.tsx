import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Globe, 
  Send, 
  AlertTriangle, 
  CheckCircle2, 
  Car, 
  Zap, 
  ShieldAlert,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const SmartVoicePage: React.FC = () => {
  const { activeVehicle } = useAuth();
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string; time: string }>>([
    {
      sender: 'assistant',
      text: "Greetings driver. I am EV SmartVoice, your AI cockpit co-pilot. I monitor real-time telemetry from your CAN-bus. Ask me about battery health, trip feasibility, or charging stops.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [language, setLanguage] = useState<'en' | 'te' | 'hi'>('en');
  const [muted, setMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alertNotice, setAlertNotice] = useState<any>(null);

  const recognitionRef = useRef<any>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      const langCodes = { en: 'en-US', te: 'te-IN', hi: 'hi-IN' };
      recognition.lang = langCodes[language];

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        if (text) handleSend(text);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }
  }, [language]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSpeaking, isListening]);

  const speak = (text: string) => {
    if (muted || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const u = new SpeechSynthesisUtterance(text);
    const langCodes = { en: 'en-US', te: 'te-IN', hi: 'hi-IN' };
    u.lang = langCodes[language];
    u.rate = 1.05;

    u.onstart = () => setIsSpeaking(true);
    u.onend = () => setIsSpeaking(false);
    u.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(u);
  };

  const handleSend = async (msg: string) => {
    if (!msg.trim() || !activeVehicle) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages((prev) => [...prev, { sender: 'user', text: msg, time }]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.sendAssistantChat(activeVehicle.id, msg, language);
      setMessages((prev) => [...prev, { sender: 'assistant', text: res.response_text, time }]);
      if (res.proactive_alert) {
        setAlertNotice(res.proactive_alert);
      }
      speak(res.audio_text || res.response_text);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {}
      } else {
        alert("Speech Recognition not supported on this browser. Please type into the command field.");
      }
    }
  };

  const sampleCommands = [
    "Hey SmartTrace, what is my battery percentage?",
    "How many kilometres can I travel?",
    "Is there any problem with my car?",
    "Explain the battery warning.",
    "Find the nearest EV charging station.",
    "How much time is required to charge to 80%?",
    "Which route consumes less energy?",
    "Show my complete vehicle health report."
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              MODULE SIX: EV SMARTVOICE
            </span>
            <span className="text-xs text-slate-400">Natural-Language Automotive Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Cockpit Voice Assistant & Conversational Intelligence
          </h1>
        </div>

        {/* Language & Voice Controls */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            <Globe className="w-3.5 h-3.5 text-slate-400 ml-1" />
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                language === 'en' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('te')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                language === 'te' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
              }`}
            >
              తెలుగు
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                language === 'hi' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
              }`}
            >
              हिन्दी
            </button>
          </div>

          <button
            onClick={() => {
              setMuted(!muted);
              window.speechSynthesis?.cancel();
            }}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          >
            {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Proactive Voice Alert Banner */}
      {alertNotice && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between animate-pulse">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-300 uppercase tracking-wide">{alertNotice.title}</p>
              <p className="text-xs text-slate-300 mt-0.5">{alertNotice.message}</p>
            </div>
          </div>
          <button
            onClick={() => setAlertNotice(null)}
            className="text-xs text-slate-400 hover:text-slate-200 ml-4 font-mono"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Siri-Like Futuristic Orb / Waveform Hero Card */}
      <div className="glass-panel-glow rounded-3xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden space-y-6">
        
        {/* Animated Radial Waves */}
        <div className="relative flex items-center justify-center">
          <div className={`w-32 h-32 rounded-full bg-gradient-to-tr from-emerald-500/20 via-cyan-500/20 to-blue-500/20 flex items-center justify-center transition-all duration-500 ${
            isListening ? 'scale-125 shadow-[0_0_50px_rgba(244,63,94,0.4)]' : isSpeaking ? 'scale-110 shadow-[0_0_50px_rgba(0,229,255,0.4)]' : ''
          }`}>
            <button
              onClick={triggerListening}
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition transform active:scale-95 ${
                isListening
                  ? 'bg-rose-500 text-white shadow-rose-500/50 animate-pulse'
                  : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-emerald-500/40 hover:scale-105'
              }`}
            >
              {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </button>
          </div>
        </div>

        {/* Waveform Bars */}
        <div className="flex items-center space-x-1.5 h-10">
          {[6, 12, 18, 28, 36, 22, 30, 16, 8, 24, 32, 14, 8].map((h, idx) => (
            <span
              key={idx}
              style={{
                height: isListening || isSpeaking ? `${Math.max(8, h * 1.2)}px` : '4px',
                transition: 'height 0.15s ease'
              }}
              className={`w-1.5 rounded-full ${
                isListening
                  ? 'bg-rose-400 animate-pulse'
                  : isSpeaking
                  ? 'bg-cyan-400 animate-pulse'
                  : 'bg-slate-700'
              }`}
            />
          ))}
        </div>

        <div>
          <span className={`text-xs font-mono font-bold tracking-wider uppercase ${
            isListening ? 'text-rose-400' : isSpeaking ? 'text-cyan-400' : 'text-slate-400'
          }`}>
            {isListening ? 'LISTENING... SPEAK YOUR COMMAND' : isSpeaking ? 'SMARTVOICE IS SPEAKING' : 'TAP MICROPHONE TO SPEAK'}
          </span>
          <p className="text-xs text-slate-500 mt-1">
            "Hey SmartTrace, what is my battery percentage?"
          </p>
        </div>

      </div>

      {/* Suggested Voice Commands */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block font-mono">
          Sample Cockpit Queries (Click to Ask)
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {sampleCommands.map((cmd, i) => (
            <button
              key={i}
              onClick={() => handleSend(cmd)}
              className="p-3 rounded-xl glass-panel text-left text-xs text-slate-300 hover:border-emerald-500/50 hover:text-emerald-300 transition"
            >
              "{cmd}"
            </button>
          ))}
        </div>
      </div>

      {/* Conversation Stream */}
      <div className="glass-panel rounded-2xl p-5 space-y-4 max-h-[420px] overflow-y-auto">
        <div className="border-b border-slate-800 pb-2 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Active Session Log</span>
          <span>{activeVehicle?.vehicle_name}</span>
        </div>

        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-emerald-600 text-white rounded-tr-none'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
              }`}
            >
              <p>{m.text}</p>
              <span className="block text-[9px] text-slate-400/80 mt-1 text-right font-mono">
                {m.time}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center space-x-2 text-xs text-slate-400 italic">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            <span>Analyzing powertrain telemetry...</span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Text Command Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="glass-panel p-2.5 rounded-2xl flex items-center space-x-2 border border-slate-800"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type an EV question (e.g. 'Can I make it to San Jose?', 'Check motor temp')..."
          className="flex-1 bg-transparent px-4 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 disabled:opacity-40 transition flex items-center space-x-1.5"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

    </div>
  );
};
