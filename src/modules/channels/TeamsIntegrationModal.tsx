import React, { useState } from 'react';
import { 
  X, MessageSquare, Save, Send, CheckCircle2, 
  Info, Bell, Shield, Layers
} from 'lucide-react';
import { ChannelService } from '../../services/channelService';

interface TeamsIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TeamsIntegrationModal: React.FC<TeamsIntegrationModalProps> = ({ isOpen, onClose }) => {
  const [webhookUrl, setWebhookUrl] = useState('https://contoso.webhook.office.com/webhookb2/00000000-0000-0000/IncomingWebhook/placeholder');
  const [targetChannel, setTargetChannel] = useState('Admin-Operations-War-Room');
  const [botAppId, setBotAppId] = useState('');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [capabilities, setCapabilities] = useState({
    taskNotifications: true,
    approvalAlerts: true,
    escalations: true,
    adminAnnouncements: true,
    ticketUpdates: true,
    dailyTaskSummaries: true
  });

  if (!isOpen) return null;

  const handleToggle = (key: keyof typeof capabilities) => {
    setCapabilities(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    ChannelService.updateChannelSettings('ms_teams', {
      webhookUrl,
      targetChannel,
      botAppId,
      capabilities
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleTestTeamsCard = () => {
    setTestResult(`[ARCHITECTURE SIMULATION] Formatted Adaptive Card JSON payload for channel "${targetChannel}". Tested webhook endpoint schema.`);
    ChannelService.addLog({
      channelId: 'ms_teams',
      channelName: 'Microsoft Teams Integration',
      event: 'Adaptive Card Alert: Ticket Breach SLA Alert',
      recipientOrUser: targetChannel,
      details: 'Adaptive Card v1.4 sent with interactive "Approve" and "View Ticket" actions',
      status: 'Pending Config'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-700 to-purple-800 text-white shadow-md">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Microsoft Teams Channel Integration
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  Channel 7
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Incoming webhooks and Teams bot alerts for instant workplace collaboration
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
          {/* Integration Notice */}
          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40 text-xs space-y-1">
            <div className="flex items-center space-x-2 text-indigo-800 dark:text-indigo-300 font-bold">
              <Info className="w-4 h-4" />
              <span>Microsoft Teams Webhook & Bot Readiness</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              This channel prepares Teams integration capability for approval alerts, ticket escalations, and daily pending task summaries. Live posting will occur once an Incoming Webhook connector URL or Microsoft Azure Bot Framework App ID is configured.
            </p>
          </div>

          {/* Webhook Fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                Teams Incoming Webhook URL
              </label>
              <input
                type="url"
                value={webhookUrl}
                onChange={e => setWebhookUrl(e.target.value)}
                placeholder="https://your-tenant.webhook.office.com/webhookb2/..."
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Target Teams Channel Name
                </label>
                <input
                  type="text"
                  value={targetChannel}
                  onChange={e => setTargetChannel(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Azure Bot Framework App ID (Optional)
                </label>
                <input
                  type="text"
                  value={botAppId}
                  onChange={e => setBotAppId(e.target.value)}
                  placeholder="Optional bot client id"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Capabilities */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Teams Notification & Card Events
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { key: 'taskNotifications', label: 'Task Notifications' },
                { key: 'approvalAlerts', label: 'Approval Request Alerts' },
                { key: 'escalations', label: 'SLA Escalation Alerts' },
                { key: 'adminAnnouncements', label: 'Admin Announcements' },
                { key: 'ticketUpdates', label: 'Ticket Status Updates' },
                { key: 'dailyTaskSummaries', label: 'Daily Pending Task Summaries' },
              ].map(item => (
                <label key={item.key} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={capabilities[item.key as keyof typeof capabilities]}
                    onChange={() => handleToggle(item.key as keyof typeof capabilities)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Test Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Test Teams Adaptive Card Dispatcher
            </h4>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">
                Format simulated Adaptive Card payload for <strong>#{targetChannel}</strong>
              </span>
              <button
                type="button"
                onClick={handleTestTeamsCard}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow transition flex items-center space-x-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Simulate Teams Post</span>
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
            {saved && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Teams configuration saved</span>
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
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md flex items-center space-x-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
