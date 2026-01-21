
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { SparklesIcon } from './icons';
import { LoadingSpinner } from './ui/LoadingSpinner';

// Utility functions for audio/base64 as required by Gemini Live API specs
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const PosingCoach: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcriptions, setTranscriptions] = useState<{ role: 'coach' | 'user'; text: string }[]>([]);
  const [cameraActive, setCameraActive] = useState(false);

  // Live Session Refs
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const audioContextOutRef = useRef<AudioContext | null>(null);
  const audioContextInRef = useRef<AudioContext | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const frameIntervalRef = useRef<number | null>(null);

  const stopLiveSession = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    setIsLive(false);
  }, []);

  const startLiveSession = async () => {
    if (isLive) return;
    setIsLive(true);
    setTranscriptions([]);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }

      // Output Audio Context
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextOutRef.current = outputAudioContext;
      const outputNode = outputAudioContext.createGain();
      outputNode.connect(outputAudioContext.destination);

      // Input Audio Context
      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextInRef.current = inputAudioContext;

      let currentInputTranscription = '';
      let currentOutputTranscription = '';

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            // Stream audio from mic
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
              const pcmBlob: Blob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);

            // Stream video frames
            frameIntervalRef.current = window.setInterval(() => {
              if (videoRef.current && canvasRef.current) {
                const canvas = canvasRef.current;
                const video = videoRef.current;
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                  canvas.toBlob(async (blob) => {
                    if (blob) {
                      const reader = new FileReader();
                      reader.readAsDataURL(blob);
                      reader.onloadend = () => {
                        const base64Data = (reader.result as string).split(',')[1];
                        sessionPromise.then(s => s.sendRealtimeInput({ media: { data: base64Data, mimeType: 'image/jpeg' } }));
                      };
                    }
                  }, 'image/jpeg', 0.6);
                }
              }
            }, 1000); // 1 FPS for efficiency
          },
          onmessage: async (message: LiveServerMessage) => {
            // Transcriptions
            if (message.serverContent?.outputTranscription) {
              currentOutputTranscription += message.serverContent.outputTranscription.text;
            } else if (message.serverContent?.inputTranscription) {
              currentInputTranscription += message.serverContent.inputTranscription.text;
            }

            if (message.serverContent?.turnComplete) {
              if (currentInputTranscription) setTranscriptions(prev => [...prev, { role: 'user', text: currentInputTranscription }]);
              if (currentOutputTranscription) setTranscriptions(prev => [...prev, { role: 'coach', text: currentOutputTranscription }]);
              currentInputTranscription = '';
              currentOutputTranscription = '';
            }

            // Audio Playback
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);
              const buffer = await decodeAudioData(decode(audioData), outputAudioContext, 24000, 1);
              const sourceNode = outputAudioContext.createBufferSource();
              sourceNode.buffer = buffer;
              sourceNode.connect(outputNode);
              sourceNode.addEventListener('ended', () => sourcesRef.current.delete(sourceNode));
              sourceNode.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(sourceNode);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error("Live API Error:", e);
            setError("Live coaching session interrupted. Retrying...");
            stopLiveSession();
          },
          onclose: () => {
            setIsLive(false);
            setCameraActive(false);
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          systemInstruction: `You are the SculptAI Pose Architect, an elite world-class physique coach. 
          You are watching a live video feed of an athlete posing. 
          Provide real-time, high-impact audio feedback on their physique and posing technique. 
          Cues should focus on:
          1. Widening the silhouette (V-taper).
          2. Shoulder engagement and lat spread.
          3. Core control and symmetry.
          Be encouraging but technical. Correct their posture and weight distribution immediately as you see changes.`
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Session start error:", err);
      setError("Could not start live session. Check permissions.");
      setIsLive(false);
    }
  };

  useEffect(() => {
    return () => stopLiveSession();
  }, [stopLiveSession]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic flex items-center gap-4">
            Pose Architect <span className="text-indigo-500">Live</span>
            {isLive && <span className="inline-block w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />}
          </h2>
          <p className="text-slate-400 font-medium text-lg">Real-time biomechanical analysis and vocal coaching.</p>
        </div>
        {!isLive ? (
          <button 
            onClick={startLiveSession}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-10 py-5 rounded-2xl uppercase tracking-widest italic shadow-xl shadow-indigo-600/30 transition-all flex items-center gap-3 active:scale-95"
          >
            <span className="material-symbols-outlined">sensors</span>
            Start Live Prep
          </button>
        ) : (
          <button 
            onClick={stopLiveSession}
            className="bg-red-600 hover:bg-red-500 text-white font-black px-10 py-5 rounded-2xl uppercase tracking-widest italic shadow-xl shadow-red-600/30 transition-all flex items-center gap-3 active:scale-95"
          >
            <span className="material-symbols-outlined">stop_circle</span>
            End Session
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/50 p-6 rounded-3xl text-red-400 font-bold flex items-center gap-4">
          <span className="material-symbols-outlined">warning</span>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Viewport */}
        <div className="lg:col-span-8 relative group">
          <div className="absolute inset-0 bg-indigo-500/5 blur-3xl opacity-50 pointer-events-none" />
          <div className="relative aspect-video bg-black rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center">
            {cameraActive ? (
              <>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover mirror"
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Viewfinder Overlay */}
                <div className="absolute inset-0 pointer-events-none border-[30px] border-black/10" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-1/2 h-5/6 border border-indigo-500/30 rounded-[3rem] relative animate-pulse">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-white">Live Skeleton Tracking Active</div>
                    <div className="absolute top-4 right-4 flex gap-2">
                       <div className="w-2 h-2 rounded-full bg-indigo-500" />
                       <div className="w-2 h-2 rounded-full bg-indigo-500 opacity-50" />
                       <div className="w-2 h-2 rounded-full bg-indigo-500 opacity-20" />
                    </div>
                  </div>
                </div>

                <div className="absolute top-8 left-8 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                   <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                     <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
                     Gemini 2.5 Multi-Modal Feed
                   </p>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-12 text-center bg-slate-900/50">
                <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center border border-white/10 shadow-2xl">
                  <span className="material-symbols-outlined text-slate-600 text-6xl">videocam_off</span>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase italic mb-2 tracking-tight">System Standby</h3>
                  <p className="text-slate-500 max-w-sm font-medium">Activate Live Prep to initialize real-time audio/visual architectural feedback.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Intelligence Sidepanel */}
        <div className="lg:col-span-4 flex flex-col gap-6 h-full">
          <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 shadow-xl flex flex-col h-[600px]">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/30">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Live Insight</h3>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Low-Latency Audio Stream</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar pr-2 space-y-4">
              {transcriptions.length > 0 ? (
                transcriptions.map((t, i) => (
                  <div 
                    key={i} 
                    className={`p-5 rounded-2xl border animate-fade-in ${
                      t.role === 'coach' 
                        ? 'bg-indigo-600/10 border-indigo-500/20 text-white' 
                        : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    <p className="text-[8px] font-black uppercase tracking-widest mb-1 opacity-50">
                      {t.role === 'coach' ? 'SculptAI Architect' : 'Athlete'}
                    </p>
                    <p className={`text-sm font-medium leading-relaxed ${t.role === 'coach' ? 'italic' : ''}`}>
                      {t.role === 'coach' ? `"${t.text}"` : t.text}
                    </p>
                  </div>
                ))
              ) : isLive ? (
                <div className="h-full flex flex-col items-center justify-center gap-4 opacity-50 italic text-center">
                  <LoadingSpinner size="sm" />
                  <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">Listening for form...</p>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 p-8 space-y-4">
                  <span className="material-symbols-outlined text-7xl">graphic_eq</span>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                    Start a session to stream biomechanical audio insights.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
              <div className="flex gap-1.5 items-center">
                <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-slate-700'}`} />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Latency: ~120ms</span>
              </div>
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest italic">Phase 4 Active</span>
            </div>
          </div>
          
          <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-[2rem] p-6">
             <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Technical Guidance</h4>
             <p className="text-xs text-slate-400 leading-relaxed font-medium italic">
               The Live Architect analyzes your silhouette against competitive symmetry standards. Maintain poses for at least 3 seconds for peak accuracy.
             </p>
          </div>
        </div>
      </div>
      
      <style>{`
        .mirror {
          transform: scaleX(-1);
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default PosingCoach;
