import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles, Send, Mic, MicOff, Trash2, ArrowLeft,
  Bot, User, CheckCircle2, AlertTriangle, ShieldAlert,
  FileText, ExternalLink, RefreshCw, X, ChevronRight,
  Clock, ShieldCheck, Zap
} from 'lucide-react';
import { ModuleId, Language } from '../../types/modules';
import { AiChatMessage, AiActionConfirmation } from '../../types/aiAgents';
import { AiCoordinatorService } from '../../services/aiCoordinatorService';

interface AiAssistantViewProps {
  onBack: () => void;
  onNavigateToModule?: (moduleId: ModuleId) => void;
  lang?: Language;
  initialPrompt?: string;
}

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({
  onBack,
  onNavigateToModule,
  lang = 'en',
  initialPrompt
}) => {
  const [messages, setMessages] = useState<AiChatMessage[]>(() => AiCoordinatorService.getChatHistory());
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingConfirmation, setEditingConfirmation] = useState<AiActionConfirmation | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedCommands = [
    'Create a maintenance complaint.',
    'Show my pending approvals.',
    'Find visitor John.',
    'Check vehicle availability.',
    'Show open gate passes.',
    'Show today\'s housekeeping pending tasks.',
    'Show high energy consumption alerts.',
    'Find vendor AMC expiry.',
    'Search document policy.'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  useEffect(() => {
    if (initialPrompt) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  // Voice Recognition using Web Speech API
  const handleToggleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. Please type your query.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = lang === 'mr' ? 'mr-IN' : 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
        // Automatically send voice query
        handleSendMessage(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg: AiChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputText('');
    setIsProcessing(true);

    setTimeout(() => {
      const result = AiCoordinatorService.processUserQuery(text, 'Current User');

      const botMsg: AiChatMessage = {
        id: `msg-bot-${Date.now()}`,
        sender: 'assistant',
        text: result.responseMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intent: result.intent,
        module: result.moduleId,
        agent: result.agentId,
        priority: result.priority,
        confirmation: result.confirmation,
        sources: result.sources,
        executedAction: result.executedAction,
        suggestedFollowups: result.suggestedFollowups
      };

      const updatedHistory = [...newHistory, botMsg];
      setMessages(updatedHistory);
      AiCoordinatorService.saveChatHistory(updatedHistory);
      setIsProcessing(false);
    }, 450);
  };

  const handleClearHistory = () => {
    if (confirm('Clear AI Assistant conversation history?')) {
      AiCoordinatorService.clearChatHistory();
      setMessages(AiCoordinatorService.getChatHistory());
    }
  };

  // Confirm sensitive action proposed by Coordinator
  const handleConfirmAction = (msgId: string, confirmation: AiActionConfirmation) => {
    const result = AiCoordinatorService.executeConfirmedAction(confirmation, 'Current User');
    
    setMessages(prev =>
      prev.map(m => {
        if (m.id === msgId && m.confirmation) {
          return {
            ...m,
            confirmation: { ...m.confirmation, status: 'Confirmed' },
            text: `${m.text}\n\n✅ ${result.message}`
          };
        }
        return m;
      })
    );
  };

  const handleCancelAction = (msgId: string) => {
    setMessages(prev =>
      prev.map(m => {
        if (m.id === msgId && m.confirmation) {
          return {
            ...m,
            confirmation: { ...m.confirmation, status: 'Cancelled' },
            text: `${m.text}\n\n❌ Proposed action was cancelled by user.`
          };
        }
        return m;
      })
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl animate-fadeIn">
      {/* Top Coordinator Banner */}
      <div className="p-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-blue-200">
              <Sparkles className="w-5 h-5 animate-pulse text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-sm font-extrabold tracking-tight text-white">
                  ADMIN AI COORDINATOR
                </h1>
                <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Orchestrator
                </span>
              </div>
              <p className="text-[11px] text-blue-100">
                Central Intelligence & 7 Specialized AI Agents
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleClearHistory}
          className="p-2 rounded-xl text-blue-200 hover:text-white hover:bg-white/10 transition"
          title="Clear Conversation"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-start space-x-2 max-w-[90%] sm:max-w-[85%]">
              {msg.sender === 'assistant' && (
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex-shrink-0 flex items-center justify-center mt-0.5 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none shadow-md'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none shadow-sm'
                }`}
              >
                {/* Agent Header Tag */}
                {msg.sender === 'assistant' && msg.agent && (
                  <div className="flex flex-wrap items-center gap-1.5 mb-2 pb-1.5 border-b border-slate-100 dark:border-slate-800 text-[10px] font-mono">
                    <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded">
                      Intent: {msg.intent || 'General'}
                    </span>
                    {msg.module && (
                      <button
                        onClick={() => onNavigateToModule && onNavigateToModule(msg.module!)}
                        className="text-slate-500 dark:text-slate-400 hover:text-blue-600 flex items-center space-x-0.5 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded transition"
                      >
                        <span>{msg.module} AI</span>
                        <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                      </button>
                    )}
                    {msg.priority && (
                      <span className={`px-1.5 py-0.5 rounded font-bold ${
                        msg.priority === 'Critical' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                        msg.priority === 'High' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {msg.priority} Priority
                      </span>
                    )}
                  </div>
                )}

                {/* Message Body with Linebreak support */}
                <div className="whitespace-pre-line">{msg.text}</div>

                {/* SENSITIVE ACTION CONFIRMATION CARD */}
                {msg.confirmation && msg.confirmation.status === 'Pending' && (
                  <div className="mt-3 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-slate-800 dark:text-slate-200 space-y-2">
                    <div className="flex items-center space-x-1.5 text-amber-700 dark:text-amber-400 font-bold text-xs">
                      <ShieldAlert className="w-4 h-4" />
                      <span>AI Action Confirmation Required</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[11px] pt-1">
                      <div className="bg-white/80 dark:bg-slate-900/80 p-1.5 rounded-lg">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">AI Understood:</span>
                        <span className="font-semibold">{msg.confirmation.intent}</span>
                      </div>
                      <div className="bg-white/80 dark:bg-slate-900/80 p-1.5 rounded-lg">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Target Module:</span>
                        <span className="font-semibold">{msg.confirmation.moduleName}</span>
                      </div>
                      <div className="col-span-2 bg-white/80 dark:bg-slate-900/80 p-1.5 rounded-lg">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Proposed Action:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{msg.confirmation.action}</span>
                      </div>
                      <div className="bg-white/80 dark:bg-slate-900/80 p-1.5 rounded-lg">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Priority & SLA:</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400">{msg.confirmation.priority} • {msg.confirmation.slaHours || 8}h SLA</span>
                      </div>
                      <div className="bg-white/80 dark:bg-slate-900/80 p-1.5 rounded-lg">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Escalation Policy:</span>
                        <span className="text-[10px] text-slate-600 dark:text-slate-400">{msg.confirmation.escalationPolicy || 'Standard'}</span>
                      </div>
                    </div>

                    {/* Action Confirmation Buttons */}
                    <div className="pt-2 flex items-center space-x-2">
                      <button
                        onClick={() => handleConfirmAction(msg.id, msg.confirmation!)}
                        className="flex-1 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center justify-center space-x-1 transition"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirm</span>
                      </button>
                      <button
                        onClick={() => setEditingConfirmation(msg.confirmation!)}
                        className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleCancelAction(msg.id)}
                        className="px-3 py-1.5 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 hover:bg-rose-200 font-bold text-xs transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* SOURCES & CITATIONS (FOR KNOWLEDGE AGENT) */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 flex items-center space-x-1">
                      <FileText className="w-3 h-3 text-blue-500" />
                      <span>Approved Knowledge Source:</span>
                    </span>
                    {msg.sources.map((src, i) => (
                      <div key={i} className="text-xs">
                        <span className="font-semibold text-blue-700 dark:text-blue-300">{src.title}</span>
                        <span className="text-[10px] text-slate-500 ml-1.5 font-mono">({src.category})</span>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 italic pt-0.5">"{src.snippet}"</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Follow-up Suggestions */}
                {msg.suggestedFollowups && msg.suggestedFollowups.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap gap-1.5">
                    {msg.suggestedFollowups.map((sug, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleSendMessage(sug)}
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 transition"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
          </div>
        ))}

        {isProcessing && (
          <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 p-2 animate-pulse">
            <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span>Coordinator is analyzing intent & routing across 7 agents...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Commands Bar */}
      <div className="p-2.5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80">
        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5 px-1">
          Quick Suggested Commands:
        </span>
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          {suggestedCommands.map((cmd, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(cmd)}
              className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 whitespace-nowrap text-[11px] font-medium border border-slate-200/60 dark:border-slate-700/60 transition"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-2">
        <button
          onClick={handleToggleVoice}
          className={`p-2.5 rounded-2xl transition ${
            isListening
              ? 'bg-rose-600 text-white animate-pulse shadow-md shadow-rose-500/30'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
          title={isListening ? 'Stop Listening' : 'Voice Input (Marathi / English)'}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
          placeholder="Ask Coordinator: e.g. 'AC in Room 3 not working' or 'Show open gate passes'..."
          className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100 placeholder-slate-400"
        />

        <button
          onClick={() => handleSendMessage()}
          disabled={!inputText.trim()}
          className="p-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white shadow-md shadow-blue-500/20 transition"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {/* Edit Confirmation Modal */}
      {editingConfirmation && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-3 animate-scaleUp">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Edit Action Parameters
              </h3>
              <button
                onClick={() => setEditingConfirmation(null)}
                className="p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500">Ticket Title</label>
                <input
                  type="text"
                  value={editingConfirmation.details.title}
                  onChange={(e) =>
                    setEditingConfirmation({
                      ...editingConfirmation,
                      details: { ...editingConfirmation.details, title: e.target.value }
                    })
                  }
                  className="w-full mt-1 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500">Priority</label>
                <select
                  value={editingConfirmation.priority}
                  onChange={(e) =>
                    setEditingConfirmation({
                      ...editingConfirmation,
                      priority: e.target.value as any,
                      slaHours: e.target.value === 'Critical' ? 2 : e.target.value === 'High' ? 4 : 8
                    })
                  }
                  className="w-full mt-1 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                >
                  <option value="Low">Low (24h SLA)</option>
                  <option value="Medium">Medium (8h SLA)</option>
                  <option value="High">High (4h SLA)</option>
                  <option value="Critical">Critical (2h SLA)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => {
                  AiCoordinatorService.executeConfirmedAction(editingConfirmation, 'Current User');
                  setEditingConfirmation(null);
                  handleSendMessage(`Confirmed updated ticket: ${editingConfirmation.details.title} (${editingConfirmation.priority} priority)`);
                }}
                className="flex-1 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow transition"
              >
                Save & Execute
              </button>
              <button
                onClick={() => setEditingConfirmation(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
