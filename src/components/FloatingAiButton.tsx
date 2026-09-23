import React from 'react';
import { Sparkles, Bot } from 'lucide-react';

interface FloatingAiButtonProps {
  onClick: () => void;
  isOpen?: boolean;
}

export const FloatingAiButton: React.FC<FloatingAiButtonProps> = ({ onClick, isOpen }) => {
  if (isOpen) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-4 z-40 flex items-center space-x-2 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20 group select-none"
      title="Open ADMIN AI Assistant & Coordinator"
    >
      <div className="relative flex items-center justify-center">
        <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
      </div>
      <div className="text-left hidden xs:block">
        <span className="text-[11px] font-extrabold tracking-tight block leading-tight">
          AI Assistant
        </span>
        <span className="text-[9px] text-blue-200 block leading-tight font-mono">
          Coordinator & 7 Agents
        </span>
      </div>
    </button>
  );
};
