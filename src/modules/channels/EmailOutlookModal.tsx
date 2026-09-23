import React, { useState } from 'react';
import { 
  X, Mail, Save, Send, CheckCircle2, 
  AlertTriangle, Shield, Check, Info
} from 'lucide-react';
import { ChannelService } from '../../services/channelService';

interface EmailOutlookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmailOutlookModal: React.FC<EmailOutlookModalProps> = ({ isOpen, onClose }) => {
  const [tenantId, setTenantId] = useState('72f988bf-86f1-41af-91ab-2d7cd011db47');
  const [clientId, setClientId] = useState('00000003-0000-0000-c000-000000000000');
  const [senderMailbox, setSenderMailbox] = useState('admin-dispatch@contoso-enterprise.com');
  const [testEmailRecipient, setTestEmailRecipient] = useState('facility-head@contoso-enterprise.com');
  
  // Capabilities checkboxes
  const [capabilities, setCapabilities] = useState({
    notifications: true,
    approvalRequests: true,
    escalations: true,
    ticketAcknowledgement: true,
    dailySummaries: true,
    reports: true
  });

  const [testResult, setTestResult] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleToggleCapability = (key: keyof typeof capabilities) => {
    setCapabilities(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    ChannelService.updateChannelSettings('email_outlook', {
      tenantId,
      clientId,
      senderMailbox,
      capabilities
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleSendTest = () => {
    setTestResult(`[ARCHITECTURE SIMULATION] Formatted HTML Email & Microsoft Graph API dispatch payload for ${testEmailRecipient} via Outlook M365.`);
    ChannelService.addLog({
      channelId: 'email_outlook',
      channelName: 'Email / Outlook Integration',
      event: 'Test Email Dispatch: Daily Facilities Summary',
      recipientOrUser: testEmailRecipient,
      details: `Generated RFC-822 formatted email for Outlook with Graph API payload`,
      status: 'Pending Config'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-800 text-white shadow-md">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Microsoft Outlook & Email Integration
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  Channel 6
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure Microsoft 365 Exchange Online & Graph API email dispatch
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Integration notice */}
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-xs space-y-1">
            <div className="flex items-center space-x-2 text-blue-800 dark:text-blue-300 font-bold">
              <Info className="w-4 h-4" />
              <span>Microsoft 365 / Outlook Integration Architecture</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              This channel provides integration-ready architecture for Microsoft Outlook / Microsoft 365. Live email dispatch activates when Azure Active Directory App Registration credentials and Microsoft Graph API permissions (<code>Mail.Send</code>) are configured in your organization.
            </p>
          </div>

          {/* Config fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                Microsoft 365 Azure Tenant ID
              </label>
              <input
                type="text"
                value={tenantId}
                onChange={e => setTenantId(e.target.value)}
                placeholder="Directory (tenant) ID"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Application (Client) ID
                </label>
                <input
                  type="text"
                  value={clientId}
                  onChange={e => setClientId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Sender Service Mailbox
                </label>
                <input
                  type="email"
                  value={senderMailbox}
                  onChange={e => setSenderMailbox(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Supported capabilities */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Email Communication Scope & Events
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { key: 'notifications', label: 'Admin Notifications' },
                { key: 'approvalRequests', label: 'Approval Requests' },
                { key: 'escalations', label: 'Breach Escalations' },
                { key: 'ticketAcknowledgement', label: 'Ticket Acknowledgements' },
                { key: 'dailySummaries', label: 'Daily Operational Summaries' },
                { key: 'reports', label: 'Monthly Admin Reports' },
              ].map(item => (
                <label key={item.key} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={capabilities[item.key as keyof typeof capabilities]}
                    onChange={() => handleToggleCapability(item.key as keyof typeof capabilities)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Test Dispatch */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Test Email Dispatcher (Simulated)
            </h4>
            <div className="flex space-x-2">
              <input
                type="email"
                value={testEmailRecipient}
                onChange={e => setTestEmailRecipient(e.target.value)}
                placeholder="Recipient email address"
                className="flex-1 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200"
              />
              <button
                type="button"
                onClick={handleSendTest}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow transition flex items-center space-x-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Test Outlook Dispatch</span>
              </button>
            </div>
            {testResult && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900">
                {testResult}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
          <div>
            {saveSuccess && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                <Check className="w-4 h-4" />
                <span>Outlook settings saved</span>
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md flex items-center space-x-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Configuration</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
