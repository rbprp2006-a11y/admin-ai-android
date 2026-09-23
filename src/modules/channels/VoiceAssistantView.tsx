import React, { useState, useEffect } from 'react';
import { 
  Mic, MicOff, Volume2, ArrowLeft, Sparkles, 
  Search, CheckCircle2, ArrowRight, CornerDownLeft, 
  HelpCircle, MessageSquare, ShieldCheck, Wrench, CalendarCheck2
} from 'lucide-react';
import { ChannelService } from '../../services/channelService';
import { VoiceCommandAction } from '../../types/channels';
import { ModuleId } from '../../types/modules';

interface VoiceAssistantViewProps {
  onBack: () => void;
  onNavigateToModule?: (moduleId: ModuleId) => void;
  lang?: string;
}

export const VoiceAssistantView: React.FC<VoiceAssistantViewProps> = ({ 
  onBack, 
  onNavigateToModule,
  lang = 'en'
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [actionResult, setActionResult] = useState<VoiceCommandAction | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [micSupported, setMicSupported] = useState(true);

  // Quick preset voice queries that represent real user voice prompts
  const sampleVoicePrompts = [
    'Check ticket status FAC-1001',
    'Search complaint AC cooling failure',
    'Find visitor status Rajesh Agrawal',
    'Check pending approvals',
    'Search asset server rack',
    'Check room availability for today',
    'Open Gate Pass AI',
    'Open Facility Maintenance'
  ];

  useEffect(() => {
    const hasSpeech = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    setMicSupported(hasSpeech);
  }, []);

  const handleExecuteQuery = (textQuery: string) => {
    setTranscript(textQuery);
    const result = ChannelService.processVoiceCommand(textQuery);
    setActionResult(result);

    // Speak response if browser supports TTS
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(result.responseMessage);
      utterance.rate = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }

    ChannelService.addLog({
      channelId: 'voice_assistant',
      channelName: 'Voice Assistant',
      event: `Voice Command Processed: ${result.detectedIntent}`,
      recipientOrUser: 'Voice User Desk',
      details: `Query: "${textQuery}" -> ${result.responseMessage.substring(0, 60)}...`,
      status: 'Active'
    });
  };

  const handleStartListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // Fallback to demo prompt if no speech recognition
      const randomPrompt = sampleVoicePrompts[Math.floor(Math.random() * sampleVoicePrompts.length)];
      handleExecuteQuery(randomPrompt);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = lang === 'mr' ? 'mr-IN' : lang === 'hi' ? 'hi-IN' : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const spoken = event.results[0][0].transcript;
        handleExecuteQuery(spoken);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        // Fallback simulation
        handleExecuteQuery('Check room availability for today');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
      handleExecuteQuery('Check pending approvals');
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Voice Assistant Channel
              </h1>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                Natural Interaction
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Speak or tap actions to query tickets, visitors, rooms, and approvals
            </p>
          </div>
        </div>

        {isSpeaking && (
          <div className="flex items-center space-x-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 animate-pulse">
            <Volume2 className="w-4 h-4" />
            <span>Speaking...</span>
          </div>
        )}
      </div>

      {/* Voice Assistant Visual Core Card */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-700 to-slate-900 text-white shadow-xl relative overflow-hidden flex flex-col items-center text-center space-y-6">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-200">
            Intelligent Voice Dispatcher
          </span>
          <h2 className="text-2xl font-black">
            {isListening ? 'Listening to your command...' : 'How can I assist you today?'}
          </h2>
          <p className="text-xs text-indigo-100 max-w-sm">
            Ask about complaints, ticket progress, visitor check-ins, or meeting room bookings
          </p>
        </div>

        {/* Big Interactive Mic Button */}
        <div className="relative">
          {isListening && (
            <div className="absolute -inset-4 rounded-full bg-white/20 animate-ping" />
          )}
          <button
            onClick={handleStartListening}
            className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition transform active:scale-95 ${
              isListening
                ? 'bg-rose-500 text-white scale-110'
                : 'bg-white text-indigo-700 hover:scale-105 hover:bg-indigo-50'
            }`}
          >
            {isListening ? <MicOff className="w-10 h-10 animate-pulse" /> : <Mic className="w-10 h-10" />}
          </button>
        </div>

        <p className="text-xs text-indigo-200 font-medium">
          {isListening ? 'Speak now into microphone...' : 'Tap the microphone to speak'}
        </p>
      </div>

      {/* Spoken Query & Resolved Action Card */}
      {actionResult && (
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/60 shadow-md space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-mono font-bold text-slate-500">Heard:</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white italic">
                "{actionResult.query}"
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              Intent: {actionResult.detectedIntent}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 text-slate-800 dark:text-slate-200 text-sm leading-relaxed font-medium">
            {actionResult.responseMessage}
          </div>

          {/* Action Button to launch the corresponding module */}
          {actionResult.targetModule && onNavigateToModule && (
            <button
              onClick={() => onNavigateToModule(actionResult.targetModule as ModuleId)}
              className="w-full p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center space-x-2 transition shadow-md"
            >
              <span>Jump to {actionResult.targetModule.toUpperCase()} Module</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Shortcut Sample Voice Prompts */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Quick Voice Commands (One-Tap Test)
          </h3>
          <span className="text-[10px] text-slate-400">Tap to execute instantly</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {sampleVoicePrompts.map((cmd, idx) => (
            <button
              key={idx}
              onClick={() => handleExecuteQuery(cmd)}
              className="p-3 text-left rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition flex items-center justify-between group"
            >
              <span className="line-clamp-1">"{cmd}"</span>
              <CornerDownLeft className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-indigo-500 transition" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
