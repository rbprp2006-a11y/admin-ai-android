import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Server, ShieldCheck, Activity, Cpu, HardDrive, RefreshCw,
  AlertTriangle, CheckCircle2, Lock, Eye, EyeOff, Sliders, Database,
  FileCode, Terminal, Download, Trash2, Smartphone, Globe, Radio,
  Bell, UserCheck, Key, ShieldAlert, Wifi, WifiOff, HelpCircle, Check, X
} from 'lucide-react';
import {
  ConfigState,
  UserRole,
  AuthSession,
  SystemHealthItem,
  DiagnosticLog,
  SystemAlert,
  OfflineQueueItem
} from '../../types/infrastructure';
import { InfrastructureService } from '../../services/infrastructureService';
import { AndroidBridgeService } from '../../services/androidBridgeService';
import { Language } from '../../types/modules';

interface InfrastructureMonitoringViewProps {
  onBack: () => void;
  lang?: Language;
}

type InfraSubTab = 'health' | 'config' | 'rbac' | 'logs' | 'alerts' | 'apk_guide';

export const InfrastructureMonitoringView: React.FC<InfrastructureMonitoringViewProps> = ({
  onBack,
  lang = 'en'
}) => {
  const [activeTab, setActiveTab] = useState<InfraSubTab>('health');
  const [config, setConfig] = useState<ConfigState>(() => InfrastructureService.getConfig());
  const [session, setSession] = useState<AuthSession>(() => InfrastructureService.getSession());
  const [healthItems, setHealthItems] = useState<SystemHealthItem[]>([]);
  const [logs, setLogs] = useState<DiagnosticLog[]>(() => InfrastructureService.getLogs());
  const [alerts, setAlerts] = useState<SystemAlert[]>(() => InfrastructureService.getAlerts());
  const [offlineQueue, setOfflineQueue] = useState<OfflineQueueItem[]>(() => InfrastructureService.getOfflineQueue());

  // Health loading state
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  // Config edit state
  const [backendUrlInput, setBackendUrlInput] = useState(config.backendUrl);
  const [envInput, setEnvInput] = useState(config.environment);
  const [sessionTimeoutInput, setSessionTimeoutInput] = useState(config.sessionTimeoutMinutes);
  const [aiConsentInput, setAiConsentInput] = useState(config.requireExternalAiConsent);
  const [configSavedNotice, setConfigSavedNotice] = useState(false);

  // Password hashing test state
  const [hashInput, setHashInput] = useState('Admin@Secure2026');
  const [hashOutput, setHashOutput] = useState('');

  // Diagnostic logs filters
  const [logFilterCategory, setLogFilterCategory] = useState<string>('All');
  const [logFilterLevel, setLogFilterLevel] = useState<string>('All');
  const [logSearch, setLogSearch] = useState('');

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);

  // Initial load
  useEffect(() => {
    refreshHealth();
    setHashOutput(InfrastructureService.hashPassword(hashInput));
  }, []);

  const refreshHealth = async () => {
    setIsCheckingHealth(true);
    const items = await InfrastructureService.checkSystemHealth();
    setHealthItems(items);
    setIsCheckingHealth(false);
  };

  const refreshAll = () => {
    setConfig(InfrastructureService.getConfig());
    setSession(InfrastructureService.getSession());
    setLogs(InfrastructureService.getLogs());
    setAlerts(InfrastructureService.getAlerts());
    setOfflineQueue(InfrastructureService.getOfflineQueue());
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = InfrastructureService.updateConfig({
      backendUrl: backendUrlInput.trim(),
      environment: envInput,
      sessionTimeoutMinutes: sessionTimeoutInput,
      requireExternalAiConsent: aiConsentInput
    });
    setConfig(updated);
    setConfigSavedNotice(true);
    setTimeout(() => setConfigSavedNotice(false), 3000);
    refreshHealth();
    refreshAll();
  };

  const handleRoleChange = (role: UserRole) => {
    const newSession = InfrastructureService.switchUserRole(role);
    setSession(newSession);
    refreshAll();
  };

  const handleManualOfflineSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      InfrastructureService.syncOfflineQueue();
      setOfflineQueue(InfrastructureService.getOfflineQueue());
      setIsSyncing(false);
      refreshHealth();
      refreshAll();
    }, 600);
  };

  const handleTriggerTestAlert = () => {
    InfrastructureService.triggerAlert(
      'Sync',
      'Medium',
      'Test alert: System verification alert across configured notification channels.'
    );
    refreshAll();
  };

  const handlePurgeLogs = () => {
    if (confirm('Are you sure you want to purge diagnostic logs older than 30 days?')) {
      const count = InfrastructureService.purgeLogs(30);
      alert(`Purged ${count} old diagnostic log entries according to data retention policy.`);
      refreshAll();
    }
  };

  const handleExportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    AndroidBridgeService.downloadFile(
      `admin_ai_diagnostics_${new Date().toISOString().slice(0, 10)}.json`,
      dataStr,
      'application/json'
    );
  };

  const filteredLogs = logs.filter(log => {
    if (logFilterCategory !== 'All' && log.category !== logFilterCategory) return false;
    if (logFilterLevel !== 'All' && log.level !== logFilterLevel) return false;
    if (logSearch && !log.message.toLowerCase().includes(logSearch.toLowerCase())) return false;
    return true;
  });

  const getHealthBadge = (status: SystemHealthItem['status']) => {
    switch (status) {
      case 'Healthy':
        return (
          <span className="flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <CheckCircle2 className="w-3 h-3" />
            <span>Healthy</span>
          </span>
        );
      case 'Warning':
        return (
          <span className="flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
            <AlertTriangle className="w-3 h-3" />
            <span>Warning</span>
          </span>
        );
      case 'Offline':
        return (
          <span className="flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
            <WifiOff className="w-3 h-3" />
            <span>Offline</span>
          </span>
        );
      case 'Not Configured':
        return (
          <span className="flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            <HelpCircle className="w-3 h-3" />
            <span>Not Configured</span>
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
            Error
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-16">
      {/* Top Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white shadow-xl border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={onBack}
            className="flex items-center space-x-1.5 text-xs text-blue-200 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
              Section 6 • Admin Only
            </span>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              {config.environment}
            </span>
          </div>
        </div>

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 flex-shrink-0">
              <Server className="w-6 h-6 text-blue-100 animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white flex items-center space-x-2">
                <span>INFRASTRUCTURE & SECURITY</span>
                <span className="text-[10px] font-normal uppercase px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                  v{config.appVersion}
                </span>
              </h1>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xl pt-0.5">
                Authoritative shared database, local-network Android connectivity, real authentication, RBAC, sanitized diagnostics, and honest offline sync management.
              </p>
            </div>
          </div>

          <button
            onClick={refreshHealth}
            disabled={isCheckingHealth}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition flex-shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCheckingHealth ? 'animate-spin text-blue-300' : ''}`} />
            <span>Run Diagnostics</span>
          </button>
        </div>

        {/* Status Line */}
        <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
          <div className="flex items-center space-x-1.5 text-blue-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Operator: <strong>{session.user.name}</strong> ({session.user.role})</span>
          </div>
          <span className="text-slate-400 font-mono hidden sm:inline">
            Authoritative URL: {config.backendUrl}
          </span>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center space-x-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('health')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl whitespace-nowrap transition ${
            activeTab === 'health'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>System Health ({healthItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl whitespace-nowrap transition ${
            activeTab === 'config'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Config & Network</span>
        </button>

        <button
          onClick={() => setActiveTab('rbac')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl whitespace-nowrap transition ${
            activeTab === 'rbac'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Security & RBAC</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl whitespace-nowrap transition ${
            activeTab === 'logs'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Sanitized Logs</span>
        </button>

        <button
          onClick={() => setActiveTab('alerts')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl whitespace-nowrap transition ${
            activeTab === 'alerts'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Alerts ({alerts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('apk_guide')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl whitespace-nowrap transition ${
            activeTab === 'apk_guide'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Android APK Guide</span>
        </button>
      </div>

      {/* SUB-TAB 1: SYSTEM HEALTH (REAL METRICS ONLY) */}
      {activeTab === 'health' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Authoritative System Health Checks
              </h2>
              <p className="text-[11px] text-slate-500">
                Verifies real database records, local-network endpoint, device sandbox, and AI agents
              </p>
            </div>
            <button
              onClick={refreshHealth}
              disabled={isCheckingHealth}
              className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold flex items-center space-x-1 hover:bg-blue-100 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCheckingHealth ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {healthItems.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 block">{item.id}</span>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.name}</h3>
                  </div>
                  {getHealthBadge(item.status)}
                </div>

                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block font-sans">Target Endpoint:</span>
                  <span className="truncate block">{item.endpoint}</span>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-400">{item.details}</p>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Latency: {item.latencyMs !== null ? `${item.latencyMs}ms` : 'N/A'}</span>
                  <span>Checked: {item.lastChecked.slice(11, 19)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Offline Local Records vs Live Shared Records Widget */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <HardDrive className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    Offline Local Queue vs Authoritative Database
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Android local-first persistence reconciles with central backend
                  </span>
                </div>
              </div>

              <button
                onClick={handleManualOfflineSync}
                disabled={isSyncing}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 transition shadow"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Reconcile & Sync</span>
              </button>
            </div>

            {offlineQueue.length === 0 ? (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>All local device records are 100% in sync with the central authoritative database.</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                {offlineQueue.map(item => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{item.action}</span>
                      <span className="text-[10px] text-slate-500 ml-2">({item.moduleId})</span>
                      <p className="text-[11px] text-slate-500">{item.payloadSummary}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.status === 'Synced to Authority'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: CONFIGURATION & NETWORK */}
      {activeTab === 'config' && (
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Infrastructure & Local-Network Configuration
            </h2>
            <p className="text-[11px] text-slate-500">
              Configure local office Wi-Fi network API URL so physical Android devices access authoritative services.
            </p>
          </div>

          {configSavedNotice && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs flex items-center space-x-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Configuration saved successfully! Diagnostics updated.</span>
            </div>
          )}

          <form onSubmit={handleSaveConfig} className="space-y-3.5 text-xs">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block">
                Deployment Environment
              </label>
              <select
                value={envInput}
                onChange={(e) => setEnvInput(e.target.value as any)}
                className="w-full mt-1 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100"
              >
                <option value="development">Development (Local Network Sandbox)</option>
                <option value="staging">Staging (Pre-Production Quality Gate)</option>
                <option value="production">Production (High Availability & TLS)</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase font-bold text-slate-400">
                  Authoritative Backend API URL
                </label>
                <span className="text-[9px] text-amber-600 dark:text-amber-400 font-semibold">
                  Do not use 127.0.0.1 for physical phones
                </span>
              </div>
              <input
                type="text"
                value={backendUrlInput}
                onChange={(e) => setBackendUrlInput(e.target.value)}
                placeholder="http://192.168.1.100:8000/api"
                className="w-full mt-1 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-xs text-slate-800 dark:text-slate-100"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Enter the IP address of your office server or development laptop on the same Wi-Fi (e.g. <code>http://192.168.1.50:8000/api</code>).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block">
                  Authoritative Database Architecture
                </label>
                <select
                  disabled
                  value={config.databaseType}
                  className="w-full mt-1 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                >
                  <option>{config.databaseType}</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block">
                  Idle Session Timeout (Minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={sessionTimeoutInput}
                  onChange={(e) => setSessionTimeoutInput(parseInt(e.target.value) || 15)}
                  className="w-full mt-1 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Privacy & AI Consent Gate */}
            <div className="p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-blue-900 dark:text-blue-200 block">
                    Privacy Gate: Require Explicit Consent Before External AI Dispatch
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Employee records, visitor IDs, and documents will not be sent to external AI without explicit consent.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={aiConsentInput}
                  onChange={(e) => setAiConsentInput(e.target.checked)}
                  className="w-5 h-5 rounded text-blue-600 cursor-pointer"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow transition"
            >
              Save Infrastructure Configuration
            </button>
          </form>
        </div>
      )}

      {/* SUB-TAB 3: SECURITY & RBAC */}
      {activeTab === 'rbac' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Active Session & Role-Based Access Control (RBAC)
              </h2>
              <p className="text-[11px] text-slate-500">
                Role switcher to test permissions across all 11 Admin AI modules
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <span className="text-slate-400">Authenticated User:</span>{' '}
                <strong className="text-slate-800 dark:text-slate-100">{session.user.name}</strong> ({session.user.department})
                <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                  Token: {session.token.slice(0, 10)}•••••••••••• | Session Expiry: {new Date(session.expiresAt).toLocaleTimeString()}
                </div>
              </div>

              <button
                onClick={() => {
                  InfrastructureService.logoutCleanup();
                  refreshAll();
                  alert('Logged out: Session tokens cleaned up from local memory.');
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-xs hover:bg-rose-200 transition flex-shrink-0"
              >
                Logout & Cleanup
              </button>
            </div>

            {/* Role Switcher */}
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Switch Role to Test Module Access:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                {(['Super Admin', 'Facility Manager', 'Security Officer', 'Department Employee', 'Compliance Auditor'] as UserRole[]).map((role) => (
                  <button
                    key={role}
                    onClick={() => handleRoleChange(role)}
                    className={`p-2 rounded-xl text-xs font-bold transition text-left ${
                      session.user.role === role
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Confidential Data Masking & Password Hashing Verification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Masking Preview */}
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5 text-xs">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-1.5">
                <Lock className="w-4 h-4 text-emerald-500" />
                <span>Confidential Data Masking</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Prevents unauthorized exposure of employee, financial, and government IDs
              </p>

              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex justify-between">
                  <span className="text-slate-400 font-sans">Govt ID / Aadhaar:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{InfrastructureService.maskGovtId('548192841289')}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex justify-between">
                  <span className="text-slate-400 font-sans">PAN Card:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{InfrastructureService.maskPan('ABCDE1234F')}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex justify-between">
                  <span className="text-slate-400 font-sans">Phone Number:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{InfrastructureService.maskPhone('9876543210')}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex justify-between">
                  <span className="text-slate-400 font-sans">Financial Amount:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{InfrastructureService.maskAmount(45000)}</span>
                </div>
              </div>
            </div>

            {/* Password Hashing Test */}
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5 text-xs">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-1.5">
                <Key className="w-4 h-4 text-indigo-500" />
                <span>Salted Password Hash Engine</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                PBKDF2-SHA256 representation prevents storing plaintext passwords
              </p>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block">Plaintext Input:</label>
                <input
                  type="text"
                  value={hashInput}
                  onChange={(e) => {
                    setHashInput(e.target.value);
                    setHashOutput(InfrastructureService.hashPassword(e.target.value));
                  }}
                  className="w-full mt-1 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block">Salted Stored Hash:</label>
                <div className="mt-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 font-mono text-[10px] break-all text-indigo-700 dark:text-indigo-300">
                  {hashOutput}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: SANITIZED DIAGNOSTIC LOGS */}
      {activeTab === 'logs' && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Diagnostics & Redacted Activity Logs
              </h2>
              <p className="text-[11px] text-slate-500">
                Passwords, authorization tokens, and personal identifiers are strictly redacted before storing.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleExportLogs}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center space-x-1 shadow transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>

              <button
                onClick={handlePurgeLogs}
                className="px-3 py-1.5 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 hover:bg-rose-200 font-bold text-xs flex items-center space-x-1 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Purge (30d)</span>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <input
              type="text"
              placeholder="Search logs..."
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100"
            />

            <select
              value={logFilterCategory}
              onChange={(e) => setLogFilterCategory(e.target.value)}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100"
            >
              <option value="All">All Categories</option>
              <option value="Android Runtime">Android Runtime</option>
              <option value="Backend API">Backend API</option>
              <option value="Database">Database</option>
              <option value="Offline Sync">Offline Sync</option>
              <option value="Security/Auth">Security/Auth</option>
              <option value="Uploads/Files">Uploads/Files</option>
            </select>

            <select
              value={logFilterLevel}
              onChange={(e) => setLogFilterLevel(e.target.value)}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100"
            >
              <option value="All">All Levels</option>
              <option value="INFO">INFO</option>
              <option value="WARN">WARN</option>
              <option value="ERROR">ERROR</option>
            </select>
          </div>

          {/* Log Items List */}
          <div className="space-y-1.5">
            {filteredLogs.map(log => (
              <div
                key={log.id}
                className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1 shadow-sm font-mono"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-slate-400 font-bold">{log.id}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold font-sans ${
                      log.level === 'ERROR'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        : log.level === 'WARN'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    }`}>
                      {log.level}
                    </span>
                    <span className="text-slate-600 dark:text-slate-300 font-sans font-semibold">
                      [{log.category}]
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">{log.timestamp.slice(0, 19).replace('T', ' ')}</span>
                </div>

                <div className="text-[11px] text-slate-700 dark:text-slate-200 break-words">
                  {log.message}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: ALERTS & NOTIFICATIONS */}
      {activeTab === 'alerts' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Multi-Channel Infrastructure Alerts
              </h2>
              <p className="text-[11px] text-slate-500">
                Failure notifications dispatched across in-app and enterprise queues (WhatsApp strictly excluded)
              </p>
            </div>

            <button
              onClick={handleTriggerTestAlert}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center space-x-1 shadow transition"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Trigger Test Alert</span>
            </button>
          </div>

          <div className="space-y-2">
            {alerts.map(alert => (
              <div
                key={alert.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] text-slate-400 font-bold">{alert.id}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">Source: {alert.source}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      alert.severity === 'High'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {alert.severity} Priority
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">{alert.timestamp.slice(11, 19)}</span>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-300">{alert.message}</p>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1.5">
                  {alert.channelsSent.map((c, cIdx) => (
                    <span
                      key={cIdx}
                      className={`text-[10px] px-2 py-0.5 rounded-lg border font-medium ${
                        c.status === 'Delivered'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {c.channel}: <strong>{c.status}</strong>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 6: FREE ANDROID APK BUILD GUIDE */}
      {activeTab === 'apk_guide' && (
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
          <div>
            <div className="flex items-center space-x-2">
              <Smartphone className="w-5 h-5 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Free Android APK Build & Installation Workflow
              </h2>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Build your own installable Android APK 100% free with Capacitor & Android Studio. No Claude Code, no paid services, no Play Console fees required.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-[11px]">
            <strong>Honest Engineering Status:</strong> The full native Android Studio project is already generated in <code>/android</code> with Capacitor 8.5.2 and synced with our React web build. Below is the step-by-step procedure to generate your free Debug APK on your laptop and install it on your Android phone.
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                Step 1: Download the Project
              </span>
              <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                Click the settings or export button in Google AI Studio to download the complete project ZIP to your computer, then extract it.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                Step 2: Sync Web Assets to Android
              </span>
              <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                Open your terminal in the extracted folder and run:
              </p>
              <div className="p-2 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px]">
                npm install<br />
                npm run android:build
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                Step 3: Open in Android Studio (Free)
              </span>
              <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                Open the <code>android</code> subfolder in free Android Studio (or run <code>npx cap open android</code>).
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                Step 4: Generate Free Debug APK
              </span>
              <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                In Android Studio, click top menu: <strong>Build → Build Bundle(s) / APK(s) → Build APK(s)</strong>.<br />
                Your installable APK will be generated at: <code>android/app/build/outputs/apk/debug/app-debug.apk</code>.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                Step 5: Install on Your Android Phone
              </span>
              <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                Transfer <code>app-debug.apk</code> to your phone via USB or Google Drive, tap to install (enable "Install unknown apps"), and launch ADMIN AI natively!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
