import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  X, 
  Send, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  AlertTriangle, 
  Globe, 
  Car, 
  Battery, 
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  intent?: string;
  proactiveAlert?: any;
  suggestedActions?: string[];
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({ isOpen, onClose }) => {
  const { activeVehicle } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello! I am EV SmartVoice, your intelligent vehicle co-pilot. Ask me about your battery percentage, driving range, vehicle health, or nearest charging stations.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        "What is my battery percentage?",
        "How many kilometres can I travel?",
        "Is there any problem with my car?",
        "Find nearest charging station"
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechMuted, setSpeechMuted] = useState(false);
  const [language, setLanguage] = useState<'en' | 'te' | 'hi'>('en');
  const [isLoading, setIsLoading] = useState(false);
  const [proactiveAlert, setProactiveAlert] = useState<{ title: string; message: string; severity: string } | null>(null);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Web Speech API for voice capture
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      
      const langCodes = { en: 'en-US', te: 'te-IN', hi: 'hi-IN' };
      recognition.lang = langCodes[language];

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          handleSendMessage(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isListening, isSpeaking]);

  const speakText = (text: string) => {
    if (speechMuted || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const langCodes = { en: 'en-US', te: 'te-IN', hi: 'hi-IN' };
    utterance.lang = langCodes[language];
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.warn('Recognition start exception:', e);
        }
      } else {
        alert("Speech Recognition is not supported on this browser. You can type commands into the text box.");
      }
    }
  };

  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || !activeVehicle) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await api.sendAssistantChat(activeVehicle.id, trimmed, language);

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: res.response_text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intent: res.intent,
        proactiveAlert: res.proactive_alert,
        suggestedActions: res.suggested_actions
      };

      setMessages((prev) => [...prev, botMsg]);

      if (res.proactive_alert) {
        setProactiveAlert(res.proactive_alert);
      }

      speakText(res.audio_text || res.response_text);
    } catch (e) {
      console.error('Assistant error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl glass-panel-glow rounded-2xl shadow-2xl border border-emerald-500/30 overflow-hidden flex flex-col h-[650px] max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-tr from-emerald-500 to-cyan-500 text-slate-950 shadow-md ${
                isSpeaking ? 'animate-pulse' : ''
              }`}>
                <Sparkles className="w-5 h-5" />
              </div>
              {isSpeaking && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                  EV SmartVoice AI
                </h3>
                <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  COCKPIT ASSISTANT
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Connected to {activeVehicle?.vehicle_name || 'CyberPulse GT'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Language Selector */}
            <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
              <Globe className="w-3.5 h-3.5 text-slate-400 ml-1" />
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                  language === 'en' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('te')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                  language === 'te' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                తెలుగు
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                  language === 'hi' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                हिन्दी
              </button>
            </div>

            {/* Mute Voice TTS Button */}
            <button
              onClick={() => {
                setSpeechMuted(!speechMuted);
                window.speechSynthesis?.cancel();
              }}
              title={speechMuted ? 'Unmute voice playback' : 'Mute voice playback'}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
            >
              {speechMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                window.speechSynthesis?.cancel();
                onClose();
              }}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Proactive Safety Alert Banner if triggered */}
        {proactiveAlert && (
          <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2.5 flex items-center justify-between animate-pulse">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-amber-300">{proactiveAlert.title}</p>
                <p className="text-[11px] text-slate-300">{proactiveAlert.message}</p>
              </div>
            </div>
            <button
              onClick={() => setProactiveAlert(null)}
              className="text-xs text-slate-400 hover:text-slate-200 ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Message Conversation Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-lg ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-none'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <span className="block text-[9px] text-slate-400/80 mt-1.5 text-right font-mono">
                  {msg.timestamp}
                </span>
              </div>

              {/* Suggested prompt chips */}
              {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 max-w-[85%]">
                  {msg.suggestedActions.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt)}
                      className="px-2.5 py-1 rounded-full text-[11px] bg-slate-900/90 border border-slate-800 text-cyan-400 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center space-x-2 text-xs text-slate-400 italic">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              <span>Analyzing vehicle telemetry...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Siri-like Animated Waveform Visualizer */}
        <div className="px-5 py-3 border-t border-slate-800/80 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleListening}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition shadow-lg ${
                isListening
                  ? 'bg-rose-500 text-white shadow-rose-500/50 animate-pulse scale-105'
                  : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-emerald-500/30 hover:scale-105'
              }`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Glowing Waveform Bars */}
            <div className="flex items-center space-x-1.5 h-8">
              {[4, 8, 12, 18, 24, 14, 20, 10, 6, 16, 22, 8, 5].map((height, i) => (
                <span
                  key={i}
                  style={{
                    height: isListening || isSpeaking ? `${Math.max(6, (height * (i % 2 === 0 ? 1.4 : 0.8)))}px` : '4px',
                    transition: 'all 0.15s ease'
                  }}
                  className={`w-1 rounded-full ${
                    isListening
                      ? 'bg-rose-400 animate-pulse'
                      : isSpeaking
                      ? 'bg-cyan-400 animate-pulse'
                      : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="text-right">
            <span className={`text-[11px] font-mono font-medium ${
              isListening ? 'text-rose-400 font-bold' : isSpeaking ? 'text-cyan-400 font-bold' : 'text-slate-500'
            }`}>
              {isListening ? 'LISTENING TO DRIVER...' : isSpeaking ? 'SPEAKING ADVISORY...' : 'CLICK MIC TO SPEAK'}
            </span>
          </div>
        </div>

        {/* Text Input Fallback Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputText);
          }}
          className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              language === 'te'
                ? "డ్రైవింగ్ లేదా బ్యాటరీ గురించి ప్రశ్న అడగండి..."
                : language === 'hi'
                ? "ड्राइविंग या बैटरी के बारे में प्रश्न पूछें..."
                : "Ask SmartTrace (e.g. 'What is my battery %?', 'Check car health')..."
            }
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 disabled:opacity-40 transition font-bold"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
