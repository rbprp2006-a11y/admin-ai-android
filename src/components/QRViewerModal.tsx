import React, { useState } from 'react';
import { X, QrCode, CheckCircle2, ShieldCheck, Printer, Copy, Check } from 'lucide-react';

interface QRViewerModalProps {
  isOpen: boolean;
  title: string;
  token: string;
  subtitle?: string;
  details?: Record<string, string>;
  onClose: () => void;
}

export const QRViewerModal: React.FC<QRViewerModalProps> = ({
  isOpen,
  title,
  token,
  subtitle,
  details = {},
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [simulatedScan, setSimulatedScan] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
            <QrCode className="w-6 h-6" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {title}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center font-medium">
            {subtitle}
          </p>
        )}

        {/* QR Visual Canvas */}
        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
          <div className="relative p-4 bg-white rounded-xl shadow-md flex items-center justify-center">
            {/* Visual SVG QR pattern */}
            <svg className="w-40 h-40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="100" height="100" fill="white"/>
              {/* Corner 1 */}
              <rect x="5" y="5" width="30" height="30" rx="4" fill="#0F172A"/>
              <rect x="10" y="10" width="20" height="20" rx="2" fill="white"/>
              <rect x="15" y="15" width="10" height="10" fill="#0D9488"/>
              {/* Corner 2 */}
              <rect x="65" y="5" width="30" height="30" rx="4" fill="#0F172A"/>
              <rect x="70" y="10" width="20" height="20" rx="2" fill="white"/>
              <rect x="75" y="15" width="10" height="10" fill="#0D9488"/>
              {/* Corner 3 */}
              <rect x="5" y="65" width="30" height="30" rx="4" fill="#0F172A"/>
              <rect x="10" y="70" width="20" height="20" rx="2" fill="white"/>
              <rect x="15" y="75" width="10" height="10" fill="#0D9488"/>
              {/* Data matrix dots */}
              <rect x="42" y="12" width="6" height="6" fill="#1E40AF"/>
              <rect x="52" y="20" width="6" height="6" fill="#0F172A"/>
              <rect x="42" y="32" width="8" height="8" fill="#0F172A"/>
              <rect x="55" y="42" width="6" height="6" fill="#1E40AF"/>
              <rect x="25" y="45" width="8" height="6" fill="#0F172A"/>
              <rect x="70" y="45" width="6" height="6" fill="#0F172A"/>
              <rect x="85" y="52" width="6" height="6" fill="#0D9488"/>
              <rect x="45" y="62" width="8" height="8" fill="#0F172A"/>
              <rect x="62" y="72" width="6" height="6" fill="#1E40AF"/>
              <rect x="80" y="80" width="10" height="10" fill="#0F172A"/>
              <rect x="42" y="82" width="8" height="6" fill="#0D9488"/>
            </svg>
          </div>
          <span className="mt-3 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 tracking-wider bg-white dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
            {token}
          </span>
        </div>

        {/* Details list */}
        {Object.keys(details).length > 0 && (
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3 text-xs space-y-1.5 border border-slate-200 dark:border-slate-800">
            {Object.entries(details).map(([k, v]) => (
              <div key={k} className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400 font-medium">{k}</span>
                <span className="text-slate-900 dark:text-white font-semibold">{v}</span>
              </div>
            ))}
          </div>
        )}

        {/* Verification Status Simulation */}
        <div className="pt-1">
          {simulatedScan ? (
            <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Simulated Gate Scan: Valid Token Verified & Logged in Security Register</span>
            </div>
          ) : (
            <button
              onClick={() => setSimulatedScan(true)}
              className="w-full flex items-center justify-center space-x-2 py-2 text-xs font-medium rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Simulate Security Gate Reader Scan</span>
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy Token'}</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            <Printer className="w-4 h-4" />
            <span>Print Pass</span>
          </button>
        </div>
      </div>
    </div>
  );
};
