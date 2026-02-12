
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../AppContext';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

const AIAssistant: React.FC = () => {
  const { askOracle, lang } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'text' | 'voice'>('text');
  
  // Text Chat State
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Live Voice State
  const [isLive, setIsLive] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [volume, setVolume] = useState(0);
  
  // Audio Resources
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioQueueRef = useRef<AudioBufferSourceNode[]>([]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, mode]);

  useEffect(() => {
    return () => {
      stopLiveSession();
    };
  }, []);

  // --- Text Mode Handlers ---
  const handleAsk = async () => {
    if (!query.trim()) return;
    const userMsg = query;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setQuery('');
    setLoading(true);

    const response = await askOracle(userMsg);
    setMessages(prev => [...prev, { role: 'ai', text: response }]);
    setLoading(false);
  };

  // --- Live API Audio Helpers ---
  const base64ToFloat32 = (base64: string): Float32Array => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    const int16View = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(int16View.length);
    for (let i = 0; i < int16View.length; i++) {
        float32[i] = int16View[i] / 32768.0;
    }
    return float32;
  };

  const float32ToBase64 = (float32: Float32Array): string => {
     const int16 = new Int16Array(float32.length);
     for(let i=0; i<float32.length; i++){
         let s = Math.max(-1, Math.min(1, float32[i]));
         int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
     }
     let binary = '';
     const bytes = new Uint8Array(int16.buffer);
     const len = bytes.byteLength;
     for (let i = 0; i < len; i++) {
         binary += String.fromCharCode(bytes[i]);
     }
     return btoa(binary);
  };

  const downsampleBuffer = (buffer: Float32Array, inputRate: number, outputRate: number) => {
      if (outputRate === inputRate) return buffer;
      const sampleRateRatio = inputRate / outputRate;
      const newLength = Math.round(buffer.length / sampleRateRatio);
      const result = new Float32Array(newLength);
      let offsetResult = 0;
      let offsetBuffer = 0;
      while (offsetResult < result.length) {
        const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
        let accum = 0, count = 0;
        for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
          accum += buffer[i];
          count++;
        }
        result[offsetResult] = count > 0 ? accum / count : 0;
        offsetResult++;
        offsetBuffer = nextOffsetBuffer;
      }
      return result;
  };

  const playAudioChunk = (base64Audio: string) => {
      if (!audioContextRef.current) return;
      
      const float32Data = base64ToFloat32(base64Audio);
      // Gemini output is 24kHz
      const buffer = audioContextRef.current.createBuffer(1, float32Data.length, 24000);
      buffer.copyToChannel(float32Data, 0);

      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);

      // Simple visualizer drive
      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 32;
      source.connect(analyser);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const updateVol = () => {
          if(!source) return;
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for(let i=0; i<dataArray.length; i++) sum+=dataArray[i];
          setVolume(sum / dataArray.length); // 0-255 approx
          requestAnimationFrame(updateVol);
      };
      updateVol();

      // Schedule seamless playback
      const currentTime = audioContextRef.current.currentTime;
      if (nextStartTimeRef.current < currentTime) {
          nextStartTimeRef.current = currentTime;
      }
      source.start(nextStartTimeRef.current);
      nextStartTimeRef.current += buffer.duration;
      
      audioQueueRef.current.push(source);
      source.onended = () => {
          audioQueueRef.current = audioQueueRef.current.filter(s => s !== source);
      };
  };

  const startLiveSession = async () => {
      setIsLive(true);
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
          
          const sessionPromise = ai.live.connect({
              model: 'gemini-2.5-flash-native-audio-preview-12-2025',
              config: {
                  responseModalities: [Modality.AUDIO],
                  speechConfig: {
                      voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
                  },
                  systemInstruction: "You are Titan Oracle, an advanced ERP AI assistant. You speak Arabic fluently, concisely and professionally. You help with sales, inventory, and insights.",
              },
              callbacks: {
                  onopen: async () => {
                      setIsConnected(true);
                      // Start Mic
                      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
                      const inputContext = new AudioContext();
                      inputSourceRef.current = inputContext.createMediaStreamSource(streamRef.current);
                      processorRef.current = inputContext.createScriptProcessor(4096, 1, 1);
                      
                      processorRef.current.onaudioprocess = async (e) => {
                          const inputData = e.inputBuffer.getChannelData(0);
                          // Downsample input to 16kHz for Gemini
                          const downsampled = downsampleBuffer(inputData, inputContext.sampleRate, 16000);
                          const base64Data = float32ToBase64(downsampled);
                          
                          // Send audio chunk
                          const session = await sessionPromise;
                          session.sendRealtimeInput({
                              media: {
                                  mimeType: 'audio/pcm;rate=16000',
                                  data: base64Data
                              }
                          });
                          
                          // Simple input visualizer fallback
                          const sum = downsampled.reduce((a, b) => a + Math.abs(b), 0);
                          setVolume((sum / downsampled.length) * 5000); 
                      };

                      inputSourceRef.current.connect(processorRef.current);
                      processorRef.current.connect(inputContext.destination);
                  },
                  onmessage: (msg: LiveServerMessage) => {
                      if (msg.serverContent?.modelTurn?.parts?.[0]?.inlineData) {
                          const audioData = msg.serverContent.modelTurn.parts[0].inlineData.data;
                          playAudioChunk(audioData);
                      }
                  },
                  onclose: () => {
                      setIsConnected(false);
                      stopLiveSession();
                  },
                  onerror: (err) => {
                      console.error("Live Error:", err);
                      setIsConnected(false);
                  }
              }
          });

      } catch (e) {
          console.error("Failed to start live session", e);
          setIsLive(false);
      }
  };

  const stopLiveSession = () => {
      setIsLive(false);
      setIsConnected(false);
      setVolume(0);
      
      if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
      }
      if (processorRef.current) {
          processorRef.current.disconnect();
          processorRef.current = null;
      }
      if (inputSourceRef.current) {
          inputSourceRef.current.disconnect();
          inputSourceRef.current = null;
      }
      if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
      }
      audioQueueRef.current.forEach(s => s.stop());
      audioQueueRef.current = [];
      nextStartTimeRef.current = 0;
  };

  return (
    <div className={`fixed bottom-10 ${lang === 'ar' ? 'left-10' : 'right-10'} z-[150]`}>
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-slate-900 text-white rounded-[2rem] shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group border-4 border-white/20"
        >
           <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-xs font-black group-hover:rotate-12 transition-transform shadow-lg">AI</div>
        </button>
      ) : (
        <div className="glass w-[350px] max-h-[600px] rounded-[50px] shadow-3xl border-white flex flex-col animate-in slide-in-from-bottom-10 duration-500 overflow-hidden">
           {/* Header */}
           <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-[10px] font-black">AI</div>
                 <span className="text-[10px] font-black uppercase tracking-widest">Titan Oracle</span>
              </div>
              <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                        if(mode === 'voice') stopLiveSession();
                        setMode(mode === 'text' ? 'voice' : 'text');
                    }}
                    className={`p-2 rounded-xl transition-all ${mode === 'voice' ? 'bg-red-500 text-white' : 'bg-white/10 hover:bg-white/20'}`}
                    title={mode === 'text' ? 'Switch to Voice' : 'Switch to Text'}
                  >
                      {mode === 'text' ? '🎙️' : '📝'}
                  </button>
                  <button onClick={() => { stopLiveSession(); setIsOpen(false); }} className="text-white/40 hover:text-white transition-colors text-xl font-bold">✕</button>
              </div>
           </div>
           
           {/* Body */}
           {mode === 'text' ? (
               <>
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-white/30 backdrop-blur-lg min-h-[300px]">
                    {messages.length === 0 && (
                        <p className="text-[10px] text-gray-400 font-bold text-center py-10 uppercase tracking-widest">How can I optimize your operations today?</p>
                    )}
                    {messages.map((m, i) => (
                        <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[85%] p-4 rounded-[20px] text-xs font-medium shadow-sm ${
                            m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                        }`}>
                            {m.text}
                        </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex items-start">
                        <div className="p-4 bg-white rounded-[20px] rounded-tl-none border border-slate-100 shadow-sm animate-pulse">
                            <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></div>
                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce delay-75"></div>
                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce delay-150"></div>
                            </div>
                        </div>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-white/50 border-t border-white/40 relative">
                    <input 
                        type="text" 
                        placeholder={lang === 'ar' ? 'اسأل الأوراكل...' : 'Ask the Oracle...'}
                        className="w-full glass-dark py-4 px-6 rounded-full outline-none font-bold pr-14 text-xs"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleAsk()}
                    />
                    <button 
                        onClick={handleAsk}
                        disabled={loading || !query.trim()}
                        className="absolute right-6 top-6 text-blue-600 disabled:opacity-20"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                </div>
               </>
           ) : (
               <div className="flex-1 flex flex-col items-center justify-center bg-slate-900 relative overflow-hidden min-h-[400px]">
                   {/* Live Visualizer */}
                   <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-50">
                       {Array.from({length: 20}).map((_, i) => (
                           <div 
                            key={i} 
                            className="w-2 bg-blue-500 rounded-full transition-all duration-75"
                            style={{ 
                                height: `${Math.max(10, Math.min(100, volume * (Math.random() + 0.5)))}%`,
                                opacity: Math.max(0.3, volume / 100)
                            }}
                           ></div>
                       ))}
                   </div>

                   <div className="relative z-10 flex flex-col items-center">
                       <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center transition-all ${isLive ? 'border-red-500 shadow-[0_0_50px_#ef4444]' : 'border-slate-700'}`}>
                           <div className={`w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-4xl shadow-2xl ${isLive ? 'animate-pulse' : ''}`}>
                               🎙️
                           </div>
                       </div>
                       
                       <div className="mt-10 text-center">
                           <h3 className="text-white font-black text-2xl tracking-tighter">
                               {isLive ? (isConnected ? 'Oracle Listening...' : 'Connecting...') : 'Voice Mode'}
                           </h3>
                           <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mt-2">
                               {isLive ? 'Gemini Live Active' : 'Ready to Connect'}
                           </p>
                       </div>

                       {!isLive ? (
                           <button 
                            onClick={startLiveSession}
                            className="mt-8 px-10 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-xl transition-all hover:scale-105"
                           >
                               Start Live Conversation
                           </button>
                       ) : (
                           <button 
                            onClick={stopLiveSession}
                            className="mt-8 px-10 py-4 bg-red-500 hover:bg-red-600 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-xl transition-all hover:scale-105"
                           >
                               End Session
                           </button>
                       )}
                   </div>
               </div>
           )}
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
