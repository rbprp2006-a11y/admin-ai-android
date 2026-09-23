import React from 'react';
import { LogOut, X, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
}

export const ExitConfirmationModal: React.FC<Props> = ({
  isOpen,
  onConfirm,
  onCancel,
  title = 'Exit ADMIN AI?',
  message = 'Are you sure you want to close the ADMIN AI Smart Admin application? Any active workflows will remain safely stored.'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
            <LogOut className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {title}
            </h3>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Android Application Exit
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {message}
        </p>

        <div className="flex items-center space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-xs font-bold text-white shadow-md transition flex items-center justify-center space-x-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit App</span>
          </button>
        </div>
      </div>
    </div>
  );
};
