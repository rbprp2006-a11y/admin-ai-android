import React, { useState } from 'react';
import { 
  ArrowLeft, Smartphone, MessageSquare, Globe, Mic, 
  Tv, Mail, Layers, CheckCircle2, AlertCircle, 
  Settings, Play, Send, Shield, Users, ArrowRight, 
  Info, RefreshCw, Radio, ToggleLeft, ToggleRight, Sparkles, Database
} from 'lucide-react';
import { 
  ChannelConfig, 
  ChannelId, 
  UserRole 
} from '../types/channels';
import { ChannelService, ROLE_CHANNEL_MAPPING } from '../services/channelService';
import { ModuleId } from '../types/modules';

// Channel Modals / Views
import { SmsSettingsModal } from './channels/SmsSettingsModal';
import { EmailOutlookModal } from './channels/EmailOutlookModal';
import { TeamsIntegrationModal } from './channels/TeamsIntegrationModal';

interface UserAccessChannelsViewProps {
  onBack: () => void;
  onLaunchKiosk: () => void;
  onLaunchVoiceAssistant: () => void;
  onLaunchWebPortal: () => void;
  onNavigateToModule: (moduleId: ModuleId) => void;
  lang?: string;
}

export const UserAccessChannelsView: React.FC<UserAccessChannelsViewProps> = ({
  onBack,
  onLaunchKiosk,
  onLaunchVoiceAssistant,
  onLaunchWebPortal,
  onNavigateToModule
}) => {
  const [channels, setChannels] = useState<ChannelConfig[]>(() => ChannelService.getChannels());
  const [selectedRole, setSelectedRole] = useState<UserRole>('Admin Staff');
  const [testStatusMap, setTestStatusMap] = useState<Record<string, { message: string; success: boolean }>>({});
  const [logs, setLogs] = useState(() => ChannelService.getLogs());

  // Modal open states
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isTeamsModalOpen, setIsTeamsModalOpen] = useState(false);

  // Toggle active / inactive
  const handleToggleStatus = (id: ChannelId) => {
    const channel = channels.find(c => c.id === id);
    if (!channel) return;
    const newStatus = channel.status === 'Active' ? 'Inactive' : 'Active';
    ChannelService.updateChannelStatus(id, newStatus);
    setChannels(ChannelService.getChannels());
    setLogs(ChannelService.getLogs());
  };

  // Test connection
  const handleTestConnection = (id: ChannelId) => {
    const result = ChannelService.testChannelConnection(id);
    setTestStatusMap(prev => ({
      ...prev,
      [id]: { message: result.message, success: result.success }
    }));
    setChannels(ChannelService.getChannels());
    setLogs(ChannelService.getLogs());
    setTimeout(() => {
      setTestStatusMap(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }, 4500);
  };

  const getChannelIcon = (id: ChannelId) => {
    switch (id) {
      case 'mobile_app':
        return Smartphone;
      case 'mobile_sms':
        return MessageSquare;
      case 'web_portal':
        return Globe;
      case 'voice_assistant':
        return Mic;
      case 'kiosk':
        return Tv;
      case 'email_outlook':
        return Mail;
      case 'ms_teams':
        return Layers;
    }
  };

  const getGradient = (id: ChannelId) => {
    switch (id) {
      case 'mobile_app':
        return 'from-blue-600 to-indigo-700';
      case 'mobile_sms':
        return 'from-sky-500 to-blue-600';
      case 'web_portal':
        return 'from-emerald-600 to-teal-700';
      case 'voice_assistant':
        return 'from-purple-600 to-indigo-700';
      case 'kiosk':
        return 'from-slate-700 to-slate-900';
      case 'email_outlook':
        return 'from-blue-700 to-indigo-900';
      case 'ms_teams':
        return 'from-indigo-600 to-violet-800';
    }
  };

  // Allowed channels for current selected role
  const allowedChannelsForRole = ROLE_CHANNEL_MAPPING[selectedRole] || [];

  return (
    <div className="space-y-5 animate-fadeIn max-w-3xl mx-auto font-sans pb-12">
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
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                User Access / Channels
              </h1>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                Section 1 Core
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              7 Multi-Channel Access Gateways connected to 11 central admin modules
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setChannels(ChannelService.getChannels());
            setLogs(ChannelService.getLogs());
          }}
          className="p-2 rounded-2xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title="Refresh Channels"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Central Architecture Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white shadow-xl space-y-3 relative overflow-hidden border border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-widest text-blue-300 flex items-center space-x-1.5">
            <Database className="w-3.5 h-3.5" />
            <span>Central Data Architecture Rule</span>
          </span>
          <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-full font-bold border border-blue-400/30">
            Single Source of Truth
          </span>
        </div>

        <p className="text-xs text-slate-200 leading-relaxed max-w-xl">
          All 7 access channels are communication/access interfaces into the <strong>same central enterprise records</strong>. A ticket logged via Mobile or Kiosk is immediately visible on the Web Portal, can be queried by Voice Assistant, and triggers Mobile SMS notifications.
        </p>
      </div>

      {/* Role-Based Access Filter Strip */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Role-Based Access Matrix (Simulate View)
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            Active: <strong className="text-blue-600 dark:text-blue-400">{selectedRole}</strong>
          </span>
        </div>

        {/* Roles pills */}
        <div className="flex flex-wrap gap-1.5">
          {(['Employees', 'Visitors', 'Vendors', 'Security', 'Admin Staff', 'Management'] as UserRole[]).map(role => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
                selectedRole === role
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>{role}</span>
              <span className={`text-[10px] px-1 rounded-full ${
                selectedRole === role ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600'
              }`}>
                {ROLE_CHANNEL_MAPPING[role].length}
              </span>
            </button>
          ))}
        </div>

        {/* Summary for selected role */}
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Allowed channels for <strong>{selectedRole}</strong>: {allowedChannelsForRole.map(c => {
            const ch = channels.find(x => x.id === c);
            return ch?.shortName || c;
          }).join(' • ')}
        </p>
      </div>

      {/* 7 Channels Cards List */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Configured Access Channels (7 Total)
          </h2>
          <span className="text-xs text-slate-500">Standardized Multi-Channel Architecture</span>
        </div>

        {channels.map(channel => {
          const IconComponent = getChannelIcon(channel.id);
          const gradient = getGradient(channel.id);
          const isAllowedForRole = allowedChannelsForRole.includes(channel.id);
          const testStatus = testStatusMap[channel.id];

          return (
            <div
              key={channel.id}
              className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border transition shadow-sm hover:shadow-md space-y-4 ${
                isAllowedForRole 
                  ? 'border-slate-200 dark:border-slate-800 ring-1 ring-blue-500/10' 
                  : 'border-slate-200 dark:border-slate-800/60 opacity-70'
              }`}
            >
              {/* Card Top Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3.5">
                  <div className={`p-3 rounded-2xl bg-gradient-to-tr ${gradient} text-white shadow-md`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {channel.name}
                      </h3>
                      {isAllowedForRole ? (
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          Role Permitted
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                          Restricted for {selectedRole}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {channel.description}
                    </p>
                  </div>
                </div>

                {/* Status Toggle Switch */}
                <div className="flex items-center space-x-2 shrink-0 self-start sm:self-auto">
                  <span className={`text-xs font-bold ${channel.status === 'Active' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                    {channel.status}
                  </span>
                  <button
                    onClick={() => handleToggleStatus(channel.id)}
                    className="text-slate-500 hover:text-blue-600 transition"
                    title="Toggle Active/Inactive"
                  >
                    {channel.status === 'Active' ? (
                      <ToggleRight className="w-7 h-7 text-emerald-500" />
                    ) : (
                      <ToggleLeft className="w-7 h-7 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Provider & Last Activity Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 font-medium">Provider / Tech:</span>{' '}
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{channel.provider}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Last Activity:</span>{' '}
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{channel.lastActivity}</span>
                </div>
              </div>

              {/* Test Status Banner if triggered */}
              {testStatus && (
                <div className={`p-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 animate-fadeIn ${
                  testStatus.success 
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900' 
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{testStatus.message}</span>
                </div>
              )}

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  {/* Test Connection Button */}
                  <button
                    onClick={() => handleTestConnection(channel.id)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center space-x-1.5"
                  >
                    <Radio className="w-3.5 h-3.5 text-blue-500" />
                    <span>Test Connection</span>
                  </button>

                  {/* Configuration / Settings Button */}
                  <button
                    onClick={() => {
                      if (channel.id === 'mobile_sms') setIsSmsModalOpen(true);
                      else if (channel.id === 'email_outlook') setIsEmailModalOpen(true);
                      else if (channel.id === 'ms_teams') setIsTeamsModalOpen(true);
                      else if (channel.id === 'voice_assistant') onLaunchVoiceAssistant();
                      else if (channel.id === 'kiosk') onLaunchKiosk();
                      else if (channel.id === 'web_portal') onLaunchWebPortal();
                      else {
                        // Mobile App default
                        alert(`Mobile App Settings:\n• PWA Standalone Mode: Enabled\n• Responsive Breakpoints: Handheld, Tablet, Foldable\n• Local Offline Storage: Active`);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center space-x-1.5"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      {channel.id === 'mobile_sms' ? 'Notification Settings' : 'Configuration'}
                    </span>
                  </button>
                </div>

                {/* Launch Channel Experience Button */}
                {channel.id === 'kiosk' && (
                  <button
                    onClick={onLaunchKiosk}
                    className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-black shadow transition flex items-center space-x-1.5"
                  >
                    <Play className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                    <span>Launch Touch Kiosk</span>
                  </button>
                )}

                {channel.id === 'voice_assistant' && (
                  <button
                    onClick={onLaunchVoiceAssistant}
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow transition flex items-center space-x-1.5"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Open Voice Assistant</span>
                  </button>
                )}

                {channel.id === 'web_portal' && (
                  <button
                    onClick={onLaunchWebPortal}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow transition flex items-center space-x-1.5"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Open Web Portal</span>
                  </button>
                )}

                {channel.id === 'mobile_sms' && (
                  <button
                    onClick={() => setIsSmsModalOpen(true)}
                    className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-black shadow transition flex items-center space-x-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Configure 13 Triggers</span>
                  </button>
                )}

                {channel.id === 'email_outlook' && (
                  <button
                    onClick={() => setIsEmailModalOpen(true)}
                    className="px-4 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-600 text-white text-xs font-black shadow transition flex items-center space-x-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Outlook Settings</span>
                  </button>
                )}

                {channel.id === 'ms_teams' && (
                  <button
                    onClick={() => setIsTeamsModalOpen(true)}
                    className="px-4 py-1.5 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-black shadow transition flex items-center space-x-1.5"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Teams Webhook Setup</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Channel Diagnostic Activity Log */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-2">
          <Radio className="w-4 h-4 text-blue-500" />
          <span>Multi-Channel Diagnostic Activity Stream</span>
        </h3>

        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {logs.map(log => (
            <div
              key={log.id}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between gap-3"
            >
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900 dark:text-white">{log.channelName}</span>
                  <span className="text-[10px] text-slate-400 font-mono">[{log.timestamp}]</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">{log.details}</p>
              </div>

              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${
                log.status === 'Active' 
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' 
                  : log.status === 'Simulated'
                  ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                  : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
              }`}>
                {log.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <SmsSettingsModal
        isOpen={isSmsModalOpen}
        onClose={() => {
          setIsSmsModalOpen(false);
          setChannels(ChannelService.getChannels());
          setLogs(ChannelService.getLogs());
        }}
      />

      <EmailOutlookModal
        isOpen={isEmailModalOpen}
        onClose={() => {
          setIsEmailModalOpen(false);
          setChannels(ChannelService.getChannels());
          setLogs(ChannelService.getLogs());
        }}
      />

      <TeamsIntegrationModal
        isOpen={isTeamsModalOpen}
        onClose={() => {
          setIsTeamsModalOpen(false);
          setChannels(ChannelService.getChannels());
          setLogs(ChannelService.getLogs());
        }}
      />
    </div>
  );
};
