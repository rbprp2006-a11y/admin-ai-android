import React, { useState } from 'react';
import {
  ArrowLeft, Network, ShieldCheck, CheckCircle2, AlertTriangle,
  RefreshCw, Power, Settings2, Play, Eye, EyeOff, Lock,
  Activity, Database, Layers, Search, Plus, Filter,
  FileCode, Sliders, Server, Cpu, CreditCard, Scan, Radio,
  Mail, ExternalLink, X, HelpCircle, Check, Clock
} from 'lucide-react';
import {
  ConnectorId,
  ConnectorConfig,
  ConnectorStatus,
  DataMappingRule,
  SyncConflict,
  IntegrationLogEntry,
  IntegrationAuditEntry,
  AuthType
} from '../../types/integrations';
import { IntegrationService } from '../../services/integrationService';
import { Language } from '../../types/modules';

interface IntegrationManagementViewProps {
  onBack: () => void;
  lang?: Language;
}

type SubTab = 'connectors' | 'mapping' | 'conflicts' | 'logs' | 'audit';

export const IntegrationManagementView: React.FC<IntegrationManagementViewProps> = ({
  onBack,
  lang = 'en'
}) => {
  const [activeTab, setActiveTab] = useState<SubTab>('connectors');
  const [connectors, setConnectors] = useState<ConnectorConfig[]>(() => IntegrationService.getConnectors());
  const [mappings, setMappings] = useState<DataMappingRule[]>(() => IntegrationService.getMappings());
  const [conflicts, setConflicts] = useState<SyncConflict[]>(() => IntegrationService.getConflicts());
  const [logs, setLogs] = useState<IntegrationLogEntry[]>(() => IntegrationService.getLogs());
  const [auditTrail, setAuditTrail] = useState<IntegrationAuditEntry[]>(() => IntegrationService.getAuditTrail());

  // Configuration Modal state
  const [editingConnector, setEditingConnector] = useState<ConnectorConfig | null>(null);
  const [secretInput, setSecretInput] = useState('');
  const [showSecret, setShowSecret] = useState(false);

  // Testing feedback state
  const [testingId, setTestingId] = useState<ConnectorId | null>(null);
  const [testResult, setTestResult] = useState<{ id: ConnectorId; success: boolean; message: string; latency?: number } | null>(null);

  // Syncing state
  const [syncingId, setSyncingId] = useState<ConnectorId | null>(null);
  const [syncResult, setSyncResult] = useState<{ id: ConnectorId; message: string } | null>(null);

  // Search filters
  const [logSearch, setLogSearch] = useState('');
  const [connectorFilter, setConnectorFilter] = useState<'All' | 'Enabled' | 'Disabled'>('All');

  // New Mapping modal state
  const [isNewMappingOpen, setIsNewMappingOpen] = useState(false);
  const [newMappingData, setNewMappingData] = useState({
    connectorId: 'hrms' as ConnectorId,
    entityName: 'Employee Master',
    internalField: '',
    externalField: '',
    description: '',
    direction: 'Bidirectional' as const
  });

  const metrics = IntegrationService.getMetrics();

  const refreshAll = () => {
    setConnectors(IntegrationService.getConnectors());
    setMappings(IntegrationService.getMappings());
    setConflicts(IntegrationService.getConflicts());
    setLogs(IntegrationService.getLogs());
    setAuditTrail(IntegrationService.getAuditTrail());
  };

  const handleToggleEnable = (connector: ConnectorConfig) => {
    const newState = !connector.isEnabled;
    const actionText = newState ? 'Enable' : 'Disable';
    if (confirm(`Are you sure you want to ${actionText} ${connector.name}?`)) {
      IntegrationService.setConnectorEnabled(connector.connectorId, newState, 'Admin User');
      refreshAll();
    }
  };

  const handleTestConnection = async (connector: ConnectorConfig) => {
    setTestingId(connector.connectorId);
    setTestResult(null);

    const res = await IntegrationService.testConnection(connector.connectorId, 'Admin User');
    setTestingId(null);
    setTestResult({
      id: connector.connectorId,
      success: res.success,
      message: res.message,
      latency: res.latencyMs
    });
    refreshAll();
  };

  const handleManualSync = async (connector: ConnectorConfig) => {
    setSyncingId(connector.connectorId);
    setSyncResult(null);

    const res = await IntegrationService.executeManualSync(connector.connectorId, 'Admin User');
    setSyncingId(null);
    setSyncResult({
      id: connector.connectorId,
      message: res.message
    });
    refreshAll();
  };

  const handleSaveConfiguration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingConnector) return;

    IntegrationService.updateConnectorConfig(
      editingConnector.connectorId,
      {
        environment: editingConnector.environment,
        baseUrl: editingConnector.baseUrl.trim(),
        apiType: editingConnector.apiType,
        authType: editingConnector.authType,
        clientId: editingConnector.clientId.trim(),
        username: editingConnector.username.trim(),
        secretMasked: secretInput ? secretInput : undefined,
        subServices: editingConnector.subServices,
        extraConfig: editingConnector.extraConfig
      },
      'Admin User'
    );

    setEditingConnector(null);
    setSecretInput('');
    setShowSecret(false);
    refreshAll();
  };

  const handleResolveConflict = (
    conflictId: string,
    resolution: 'Keep Internal' | 'Use External' | 'Merge' | 'Ignore'
  ) => {
    IntegrationService.resolveConflict(conflictId, resolution, 'Admin User');
    refreshAll();
  };

  const handleAddMappingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMappingData.internalField || !newMappingData.externalField) return;

    IntegrationService.addMapping(newMappingData, 'Admin User');
    setIsNewMappingOpen(false);
    setNewMappingData({
      connectorId: 'hrms',
      entityName: 'Employee Master',
      internalField: '',
      externalField: '',
      description: '',
      direction: 'Bidirectional'
    });
    refreshAll();
  };

  const filteredConnectors = connectors.filter(c => {
    if (connectorFilter === 'Enabled') return c.isEnabled;
    if (connectorFilter === 'Disabled') return !c.isEnabled;
    return true;
  });

  const filteredLogs = logs.filter(
    l =>
      l.connectorName.toLowerCase().includes(logSearch.toLowerCase()) ||
      l.operation.toLowerCase().includes(logSearch.toLowerCase()) ||
      l.destination.toLowerCase().includes(logSearch.toLowerCase()) ||
      (l.errorMessage && l.errorMessage.toLowerCase().includes(logSearch.toLowerCase()))
  );

  const getConnectorIcon = (id: ConnectorId) => {
    switch (id) {
      case 'sap_erp':
        return <Server className="w-5 h-5 text-blue-500" />;
      case 'hrms':
        return <Layers className="w-5 h-5 text-purple-500" />;
      case 'email_smtp':
        return <Mail className="w-5 h-5 text-indigo-500" />;
      case 'm365':
        return <Network className="w-5 h-5 text-cyan-500" />;
      case 'iot_devices':
        return <Cpu className="w-5 h-5 text-teal-500" />;
      case 'payment_gateway':
        return <CreditCard className="w-5 h-5 text-amber-500" />;
      case 'biometric_face':
        return <Scan className="w-5 h-5 text-rose-500" />;
      case 'third_party_api':
        return <Radio className="w-5 h-5 text-emerald-500" />;
      default:
        return <Settings2 className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-14">
      {/* Top Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white shadow-xl border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={onBack}
            className="flex items-center space-x-1.5 text-xs text-blue-200 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            Section 4 • Future-Ready Architecture
          </span>
        </div>

        <div className="flex items-start space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 flex-shrink-0">
            <Network className="w-6 h-6 animate-pulse text-indigo-200" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white flex items-center space-x-2">
              <span>INTEGRATION LAYER</span>
              <span className="text-[10px] font-normal uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                External Systems
              </span>
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xl pt-0.5">
              Future-ready modular integration architecture for enterprise systems. All connectors remain disabled by default and configuration-ready until authorized Admin credentials are provided.
            </p>
          </div>
        </div>

        {/* Security & Fail-Safe Warning */}
        <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
          <div className="flex items-center space-x-1.5 text-amber-400 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Fail-Safe Mode Active: External unavailability will never crash core Admin AI modules.</span>
          </div>
          <span className="text-slate-400 hidden sm:inline">Strictly No WhatsApp Integration</span>
        </div>
      </div>

      {/* Integration Monitoring Dashboard Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Connectors</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{metrics.total}</span>
            <span className="text-[10px] text-slate-500 font-mono">Future Ready</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Connected</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-xl font-extrabold text-emerald-600">{metrics.connected}</span>
            <span className="text-[10px] text-slate-500 font-mono">Live Sync</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Disabled (Default)</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-xl font-extrabold text-amber-600">{metrics.disabled}</span>
            <span className="text-[10px] text-slate-500 font-mono">Standby</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Pending Conflicts</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-xl font-extrabold text-indigo-600">{conflicts.filter(c => c.status === 'Pending').length}</span>
            <span className="text-[10px] text-slate-500 font-mono">Need Approval</span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center space-x-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('connectors')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl whitespace-nowrap transition ${
            activeTab === 'connectors'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
          }`}
        >
          <Network className="w-4 h-4" />
          <span>8 Connectors</span>
        </button>

        <button
          onClick={() => setActiveTab('mapping')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl whitespace-nowrap transition ${
            activeTab === 'mapping'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Data Mapping</span>
        </button>

        <button
          onClick={() => setActiveTab('conflicts')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl whitespace-nowrap transition ${
            activeTab === 'conflicts'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Sync Conflicts ({conflicts.filter(c => c.status === 'Pending').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl whitespace-nowrap transition ${
            activeTab === 'logs'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Integration Logs</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl whitespace-nowrap transition ${
            activeTab === 'audit'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Audit Trail</span>
        </button>
      </div>

      {/* SUB-TAB 1: 8 CONNECTORS CARDS */}
      {activeTab === 'connectors' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Showing {filteredConnectors.length} future-ready connectors (Disabled by default)
            </span>
            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl">
              {(['All', 'Enabled', 'Disabled'] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => setConnectorFilter(filter)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                    connectorFilter === filter
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredConnectors.map((connector, index) => (
              <div
                key={connector.connectorId}
                className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 relative overflow-hidden"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800">
                      {getConnectorIcon(connector.connectorId)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          {index + 1}. {connector.name}
                        </h3>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium block">
                        {connector.category}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      connector.status === 'Connected'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : connector.status === 'Configured'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {connector.status}
                  </span>
                </div>

                {/* Sub-services pills */}
                {connector.subServices && connector.subServices.length > 0 && (
                  <div className="space-y-1 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl text-[11px]">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Targeted Integration Data Areas:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {connector.subServices.map((sub, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-[10px]"
                        >
                          {sub.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Base URL / Endpoint</span>
                    <span className="font-mono text-slate-700 dark:text-slate-200 truncate block">
                      {connector.baseUrl || '(Not Configured)'}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Auth & Credentials</span>
                    <span className="text-slate-700 dark:text-slate-200 font-medium">
                      {connector.authType} {connector.hasSecretConfigured ? '• (Configured)' : '• (Unset)'}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Last Sync / Status</span>
                    <span className="text-slate-700 dark:text-slate-200">
                      {connector.lastSync ? connector.lastSync.slice(0, 16) : 'Never Synced'}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Health & Retry</span>
                    <span className="text-slate-700 dark:text-slate-200 font-mono">
                      {connector.health} • {connector.retryStatus}
                    </span>
                  </div>
                </div>

                {/* Action Feedback Alerts */}
                {testResult && testResult.id === connector.connectorId && (
                  <div
                    className={`p-2.5 rounded-xl text-xs flex items-center space-x-2 ${
                      testResult.success
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                    }`}
                  >
                    {testResult.success ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
                    <span>{testResult.message}</span>
                  </div>
                )}

                {syncResult && syncResult.id === connector.connectorId && (
                  <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800 text-xs flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>{syncResult.message}</span>
                  </div>
                )}

                {/* Card Action Buttons */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setEditingConnector(connector);
                        setSecretInput('');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 flex items-center space-x-1 transition"
                    >
                      <Settings2 className="w-3.5 h-3.5" />
                      <span>Configure</span>
                    </button>

                    <button
                      onClick={() => handleTestConnection(connector)}
                      disabled={testingId === connector.connectorId}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 flex items-center space-x-1 transition"
                    >
                      <Play className={`w-3.5 h-3.5 ${testingId === connector.connectorId ? 'animate-spin' : ''}`} />
                      <span>Test</span>
                    </button>

                    {connector.isEnabled && (
                      <button
                        onClick={() => handleManualSync(connector)}
                        disabled={syncingId === connector.connectorId}
                        className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 font-bold flex items-center space-x-1 transition"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${syncingId === connector.connectorId ? 'animate-spin' : ''}`} />
                        <span>Sync</span>
                      </button>
                    )}
                  </div>

                  {/* Enable / Disable Toggle */}
                  <button
                    onClick={() => handleToggleEnable(connector)}
                    className={`px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1 transition ${
                      connector.isEnabled
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 hover:bg-rose-200'
                        : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{connector.isEnabled ? 'Disable' : 'Enable'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: DATA MAPPING */}
      {activeTab === 'mapping' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Enterprise Data Mapping Rules
              </h2>
              <p className="text-[11px] text-slate-500">
                Maps internal Admin AI data models to external ERP/HRMS schemas without blind overwrite
              </p>
            </div>
            <button
              onClick={() => setIsNewMappingOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center space-x-1 transition shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Add Mapping Rule</span>
            </button>
          </div>

          <div className="space-y-2">
            {mappings.map(map => (
              <div
                key={map.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] font-bold text-slate-400">{map.id}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{map.entityName}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                      {map.connectorId.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Updated: {map.lastUpdated}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-mono text-[11px] flex items-center justify-between">
                  <div className="text-blue-700 dark:text-blue-300">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block font-sans">Internal Field</span>
                    {map.internalField}
                  </div>
                  <div className="text-slate-400 text-sm">↔</div>
                  <div className="text-purple-700 dark:text-purple-300 text-right">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block font-sans">External Target Field</span>
                    {map.externalField}
                  </div>
                </div>

                <p className="text-[11px] text-slate-500">{map.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: CONFLICT MANAGEMENT */}
      {activeTab === 'conflicts' && (
        <div className="space-y-3">
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Sync Conflict Resolution
            </h2>
            <p className="text-[11px] text-slate-500">
              Controlled discrepancy resolution. Important values are never blindly overwritten.
            </p>
          </div>

          <div className="space-y-2.5">
            {conflicts.map(conf => (
              <div
                key={conf.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center space-x-1">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{conf.entityType} Discrepancy: {conf.entityId}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">[{conf.connectorName}]</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      conf.status === 'Resolved'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {conf.status} {conf.resolution ? `(${conf.resolution})` : ''}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
                    <span className="text-[10px] font-bold uppercase text-blue-700 dark:text-blue-300 block">Internal Record:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">{conf.internalValue}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900">
                    <span className="text-[10px] font-bold uppercase text-purple-700 dark:text-purple-300 block">External Feed:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">{conf.externalValue}</span>
                  </div>
                </div>

                {/* Resolution Buttons */}
                {conf.status === 'Pending' && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Admin Decision:</span>
                    <button
                      onClick={() => handleResolveConflict(conf.id, 'Keep Internal')}
                      className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition shadow-sm"
                    >
                      Keep Internal
                    </button>
                    <button
                      onClick={() => handleResolveConflict(conf.id, 'Use External')}
                      className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] transition shadow-sm"
                    >
                      Use External
                    </button>
                    <button
                      onClick={() => handleResolveConflict(conf.id, 'Merge')}
                      className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px] transition"
                    >
                      Merge
                    </button>
                    <button
                      onClick={() => handleResolveConflict(conf.id, 'Ignore')}
                      className="px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-[11px] transition"
                    >
                      Ignore
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: INTEGRATION LOGS */}
      {activeTab === 'logs' && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Searchable Integration Logs
              </h2>
              <p className="text-[11px] text-slate-500">
                Audited external requests, payloads, durations, and error messages
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search logs by connector, error..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                className="w-full text-xs p-2 pl-7 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
            </div>
          </div>

          <div className="space-y-2">
            {filteredLogs.map(log => (
              <div
                key={log.id}
                className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] text-slate-400 font-bold">{log.id}</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{log.connectorName}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                      {log.operation}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {log.date} {log.time} • {log.durationMs}ms
                  </span>
                </div>

                <div className="text-[11px] text-slate-600 dark:text-slate-300">
                  <span className="text-slate-400">Target:</span> {log.destination} | <span className="text-slate-400">Trigger:</span> {log.userTrigger}
                </div>

                {log.errorMessage && (
                  <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-[11px]">
                    <span className="font-bold">Error:</span> {log.errorMessage}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="space-y-3">
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Security Audit Trail
            </h2>
            <p className="text-[11px] text-slate-500">
              Immutable log of configuration edits, credential updates, and administrator interventions
            </p>
          </div>

          <div className="space-y-2">
            {auditTrail.map(audit => (
              <div
                key={audit.id}
                className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{audit.action}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{audit.date} {audit.time}</span>
                </div>
                <p className="text-[11px] text-slate-700 dark:text-slate-300">{audit.details}</p>
                <span className="text-[10px] text-slate-400 block">Operator: {audit.user}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: CONNECTOR CONFIGURATION */}
      {editingConnector && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Settings2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Configure {editingConnector.name}
                </h3>
              </div>
              <button
                onClick={() => setEditingConnector(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveConfiguration} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block">Environment</label>
                <select
                  value={editingConnector.environment}
                  onChange={(e) =>
                    setEditingConnector({ ...editingConnector, environment: e.target.value as any })
                  }
                  className="w-full mt-1 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                >
                  <option value="Development">Development (Sandbox)</option>
                  <option value="Staging">Staging (Pre-Production)</option>
                  <option value="Production">Production (Live)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block">Base URL / Endpoint</label>
                <input
                  type="text"
                  placeholder="https://api.enterprise.company.com/v1"
                  value={editingConnector.baseUrl}
                  onChange={(e) =>
                    setEditingConnector({ ...editingConnector, baseUrl: e.target.value })
                  }
                  className="w-full mt-1 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block">API Protocol</label>
                  <select
                    value={editingConnector.apiType}
                    onChange={(e) =>
                      setEditingConnector({ ...editingConnector, apiType: e.target.value as any })
                    }
                    className="w-full mt-1 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  >
                    <option value="REST">REST API</option>
                    <option value="OData">OData</option>
                    <option value="GraphQL">GraphQL</option>
                    <option value="SOAP">SOAP</option>
                    <option value="MQTT">MQTT</option>
                    <option value="SMTP">SMTP</option>
                    <option value="Graph API">Graph API</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block">Auth Type</label>
                  <select
                    value={editingConnector.authType}
                    onChange={(e) =>
                      setEditingConnector({ ...editingConnector, authType: e.target.value as any })
                    }
                    className="w-full mt-1 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  >
                    <option value="OAuth 2.0">OAuth 2.0</option>
                    <option value="API Key">API Key</option>
                    <option value="Bearer Token">Bearer Token</option>
                    <option value="Basic Auth">Basic Auth</option>
                    <option value="Certificate / mTLS">Certificate / mTLS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block">Client ID / Username</label>
                <input
                  type="text"
                  placeholder="enterprise-admin-service-account"
                  value={editingConnector.clientId}
                  onChange={(e) =>
                    setEditingConnector({ ...editingConnector, clientId: e.target.value })
                  }
                  className="w-full mt-1 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase font-bold text-slate-400">
                    API Secret / Token / Password
                  </label>
                  <span className="text-[9px] text-amber-500 font-medium">Masked for Security</span>
                </div>
                <div className="relative mt-1">
                  <input
                    type={showSecret ? 'text' : 'password'}
                    placeholder={editingConnector.hasSecretConfigured ? '•••••••••••••••• (Configured)' : 'Enter secure API token/secret'}
                    value={secretInput}
                    onChange={(e) => setSecretInput(e.target.value)}
                    className="w-full p-2.5 pr-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-3 flex items-center space-x-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow transition"
                >
                  Save Configuration
                </button>
                <button
                  type="button"
                  onClick={() => setEditingConnector(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD DATA MAPPING */}
      {isNewMappingOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                New Enterprise Data Mapping
              </h3>
              <button
                onClick={() => setIsNewMappingOpen(false)}
                className="p-1 rounded-xl text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMappingSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block">Target Connector</label>
                <select
                  value={newMappingData.connectorId}
                  onChange={(e) =>
                    setNewMappingData({ ...newMappingData, connectorId: e.target.value as any })
                  }
                  className="w-full mt-1 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                >
                  <option value="sap_erp">SAP ERP Connector</option>
                  <option value="hrms">HRMS Connector</option>
                  <option value="iot_devices">IoT / Devices Connector</option>
                  <option value="payment_gateway">Payment Gateway Connector</option>
                  <option value="third_party_api">Third Party API Connector</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block">Entity Name</label>
                <input
                  type="text"
                  placeholder="e.g. Employee Master, Purchase Order"
                  value={newMappingData.entityName}
                  onChange={(e) =>
                    setNewMappingData({ ...newMappingData, entityName: e.target.value })
                  }
                  className="w-full mt-1 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block">Internal Field</label>
                  <input
                    type="text"
                    placeholder="e.g. vendor_id"
                    value={newMappingData.internalField}
                    onChange={(e) =>
                      setNewMappingData({ ...newMappingData, internalField: e.target.value })
                    }
                    className="w-full mt-1 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block">External Field</label>
                  <input
                    type="text"
                    placeholder="e.g. sap_lifnr"
                    value={newMappingData.externalField}
                    onChange={(e) =>
                      setNewMappingData({ ...newMappingData, externalField: e.target.value })
                    }
                    className="w-full mt-1 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block">Rule Description</label>
                <input
                  type="text"
                  placeholder="Business explanation of data conversion"
                  value={newMappingData.description}
                  onChange={(e) =>
                    setNewMappingData({ ...newMappingData, description: e.target.value })
                  }
                  className="w-full mt-1 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="pt-2 flex items-center space-x-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow transition"
                >
                  Create Rule
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewMappingOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
