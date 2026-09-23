import React, { useState } from 'react';
import { 
  X, MessageSquare, Save, Send, CheckCircle2, 
  AlertTriangle, Shield, Settings2, Bell, Smartphone, RefreshCw 
} from 'lucide-react';
import { ChannelService } from '../../services/channelService';
import { SmsNotificationSetting, SmsTriggerEvent } from '../../types/channels';

interface SmsSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SmsSettingsModal: React.FC<SmsSettingsModalProps> = ({ isOpen, onClose }) => {
  const [smsSettings, setSmsSettings] = useState<SmsNotificationSetting[]>(() => ChannelService.getSmsSettings());
  const [selectedSettingId, setSelectedSettingId] = useState<string>(smsSettings[0]?.id || '');
  
  // Provider configuration state
  const [provider, setProvider] = useState<'Twilio' | 'MSG91' | 'Textlocal' | 'AWS SNS'>('Twilio');
  const [senderId, setSenderId] = useState('ADMAI');
  const [accountSid, setAccountSid] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  // Test Dispatch state
  const [testRecipient, setTestRecipient] = useState('+91 98201 44521');
  const [testResult, setTestResult] = useState<{ message: string; preview: string } | null>(null);

  if (!isOpen) return null;

  const currentSetting = smsSettings.find(s => s.id === selectedSettingId) || smsSettings[0];

  const handleUpdateCurrent = (field: keyof SmsNotificationSetting, val: any) => {
    const updated = smsSettings.map(s => {
      if (s.id === currentSetting.id) {
        return { ...s, [field]: val };
      }
      return s;
    });
    setSmsSettings(updated);
  };

  const handleSaveAll = () => {
    ChannelService.saveSmsSettings(smsSettings);
    ChannelService.updateChannelSettings('mobile_sms', {
      provider,
      senderId,
      accountSid,
      apiKeyConfigured: Boolean(apiKey)
    });
    setSaveFeedback('SMS Notification settings and templates saved successfully!');
    setTimeout(() => setSaveFeedback(null), 3000);
  };

  const handleSendTestSms = () => {
    const formatted = currentSetting.template
      .replace('{ticketId}', 'FAC-1001')
      .replace('{location}', 'Floor 2 Server Room')
      .replace('{assignee}', 'Suresh Patil')
      .replace('{slaDeadline}', '2 Hours')
      .replace('{passNumber}', 'GP-2026-001')
      .replace('{requesterName}', 'Rajesh Agrawal')
      .replace('{approverName}', 'Neha Kulkarni')
      .replace('{validUntil}', 'Today 18:00')
      .replace('{remarks}', 'Material count mismatch')
      .replace('{title}', 'AC Cooling Failure')
      .replace('{name}', 'Rajesh Agrawal')
      .replace('{hostEmployee}', 'Neha Kulkarni')
      .replace('{qrCode}', 'QR-GATE-101')
      .replace('{passType}', 'Material Outward')
      .replace('{vehicleNumber}', 'MH-12-DE-4412')
      .replace('{driverName}', 'Ramesh Kale')
      .replace('{routeStart}', 'Campus Gate 1')
      .replace('{routeEnd}', 'Airport Terminal 2')
      .replace('{departureTime}', '14:30 PM')
      .replace('{status}', 'In Progress')
      .replace('{otpCode}', '481920');

    setTestResult({
      message: `[ARCHITECTURAL TEST] SMS formatted for delivery via ${provider}`,
      preview: formatted
    });

    ChannelService.addLog({
      channelId: 'mobile_sms',
      channelName: 'Mobile SMS Gateway',
      event: `Test SMS Trigger: ${currentSetting.triggerEvent}`,
      recipientOrUser: testRecipient,
      details: `Dispatched preview to ${testRecipient} using ${provider}`,
      status: 'Simulated'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl max-h-[90vh] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-md">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Mobile SMS Gateway Configuration
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  Section 1 Channel
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure triggers, templates, provider APIs (Twilio, MSG91, Textlocal, AWS SNS)
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Provider Architecture Notice */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 flex items-start space-x-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">SMS Provider Connection & Architecture</p>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Real SMS sending requires an active SMS gateway API key. The system is architected to seamlessly connect with <strong>Twilio, MSG91, Textlocal, or AWS SNS</strong>. Test dispatches below simulate exact SMS payloads and logs without incurring carrier charges.
              </p>
            </div>
          </div>

          {/* Provider Configuration Row */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-2">
              <Settings2 className="w-4 h-4 text-blue-500" />
              <span>SMS Gateway Provider Setup</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Target Provider</label>
                <select
                  value={provider}
                  onChange={e => setProvider(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="Twilio">Twilio SMS API</option>
                  <option value="MSG91">MSG91 Enterprise SMS</option>
                  <option value="Textlocal">Textlocal India DLT</option>
                  <option value="AWS SNS">Amazon AWS SNS</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Sender ID / DLT Header</label>
                <input
                  type="text"
                  value={senderId}
                  onChange={e => setSenderId(e.target.value)}
                  placeholder="e.g. ADMAI"
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">API Key / Token</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="Enter provider API key"
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Trigger Event Selector & Editor */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* List of 13 Trigger Events */}
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Configurable Triggers ({smsSettings.length})
              </label>
              {smsSettings.map(item => (
                <button
                  key={item.id}
                  onClick={() => setSelectedSettingId(item.id)}
                  className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold transition flex items-center justify-between ${
                    item.id === currentSetting.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className="truncate pr-1">{item.triggerEvent}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full uppercase font-bold shrink-0 ${
                    item.enabled ? (item.id === currentSetting.id ? 'bg-white/20 text-white' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300') : 'bg-slate-300 dark:bg-slate-700 text-slate-600'
                  }`}>
                    {item.enabled ? 'ON' : 'OFF'}
                  </span>
                </button>
              ))}
            </div>

            {/* Template Editor for Selected Trigger */}
            <div className="md:col-span-2 space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Trigger: {currentSetting.triggerEvent}
                </h4>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium text-slate-500">Enable SMS:</span>
                  <input
                    type="checkbox"
                    checked={currentSetting.enabled}
                    onChange={e => handleUpdateCurrent('enabled', e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Priority</label>
                  <select
                    value={currentSetting.priority}
                    onChange={e => handleUpdateCurrent('priority', e.target.value)}
                    className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical (Instant)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Target Recipient Role</label>
                  <input
                    type="text"
                    value={currentSetting.recipientRole}
                    onChange={e => handleUpdateCurrent('recipientRole', e.target.value)}
                    className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  SMS Body Template (With Variables)
                </label>
                <textarea
                  rows={3}
                  value={currentSetting.template}
                  onChange={e => handleUpdateCurrent('template', e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                />
                <span className="text-[10px] text-slate-400">
                  Supported tokens: &#123;ticketId&#125;, &#123;location&#125;, &#123;passNumber&#125;, &#123;name&#125;, &#123;otpCode&#125;, &#123;vehicleNumber&#125;, &#123;status&#125;
                </span>
              </div>
            </div>
          </div>

          {/* Test Dispatch Tool */}
          <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/40 space-y-3">
            <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center space-x-1.5">
              <Send className="w-3.5 h-3.5" />
              <span>Test SMS Dispatch Simulator</span>
            </h4>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="tel"
                value={testRecipient}
                onChange={e => setTestRecipient(e.target.value)}
                placeholder="Mobile number with country code"
                className="w-full sm:w-64 p-2 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
              />
              <button
                type="button"
                onClick={handleSendTestSms}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow transition flex items-center justify-center space-x-1.5"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Simulate Dispatch for [{currentSetting.triggerEvent}]</span>
              </button>
            </div>

            {testResult && (
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-800 text-xs space-y-1 animate-fadeIn">
                <p className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{testResult.message}</span>
                </p>
                <p className="font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 p-2 rounded-lg">
                  "{testResult.preview}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
          <div>
            {saveFeedback && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>{saveFeedback}</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAll}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition flex items-center space-x-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save SMS Configuration</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
