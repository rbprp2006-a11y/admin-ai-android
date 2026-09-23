import React, { useState } from 'react';
import {
  ArrowLeft, Sparkles, Bot, ShieldCheck, Zap,
  Activity, Database, Layers, CheckCircle2, AlertCircle,
  FileText, Search, Send, Clock, RefreshCw, ThumbsUp,
  ThumbsDown, AlertTriangle, Cpu, Radio, Network, GitBranch,
  Sliders, TrendingUp, BarChart3, Scan, ShieldAlert, CheckSquare
} from 'lucide-react';
import { ModuleId, Language } from '../../types/modules';
import { AgentId, FeedbackType } from '../../types/aiAgents';
import { AiCoordinatorService } from '../../services/aiCoordinatorService';
import { APPROVED_KNOWLEDGE_BASE } from '../../services/aiKnowledgeBase';
import { AiAssistantView } from './AiAssistantView';

interface AiAgentsDashboardViewProps {
  onBack: () => void;
  onNavigateToModule?: (moduleId: ModuleId) => void;
  lang?: Language;
}

type TabType = 'assistant' | 'agents' | 'capabilities' | 'logs';

export const AiAgentsDashboardView: React.FC<AiAgentsDashboardViewProps> = ({
  onBack,
  onNavigateToModule,
  lang = 'en'
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('assistant');
  const [logSearch, setLogSearch] = useState('');
  const [kbSearch, setKbSearch] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('Helpful');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Live data from shared coordinator service
  const operationalData = AiCoordinatorService.getOperationalInsights();
  const connectors = AiCoordinatorService.getIntegrationConnectors();
  const workflowRules = AiCoordinatorService.getWorkflowRules();
  const logs = AiCoordinatorService.getActivityLogs();
  const feedbackList = AiCoordinatorService.getFeedback();

  const filteredLogs = logs.filter(
    l =>
      l.request.toLowerCase().includes(logSearch.toLowerCase()) ||
      l.detectedIntent.toLowerCase().includes(logSearch.toLowerCase()) ||
      l.selectedModule.toLowerCase().includes(logSearch.toLowerCase()) ||
      l.selectedAgent.toLowerCase().includes(logSearch.toLowerCase())
  );

  const filteredKb = APPROVED_KNOWLEDGE_BASE.filter(
    k =>
      k.title.toLowerCase().includes(kbSearch.toLowerCase()) ||
      k.content.toLowerCase().includes(kbSearch.toLowerCase()) ||
      k.category.toLowerCase().includes(kbSearch.toLowerCase())
  );

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    AiCoordinatorService.submitFeedback({
      feedbackType,
      comment: feedbackText.trim(),
      user: 'Admin Staff'
    });

    setFeedbackText('');
    setFeedbackSuccess(true);
    setTimeout(() => setFeedbackSuccess(false), 3000);
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-12">
      {/* Top Section 3 Header */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-blue-950 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={onBack}
            className="flex items-center space-x-1.5 text-xs text-blue-200 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
            Section 3 • Production Ready
          </span>
        </div>

        <div className="flex items-start space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 flex-shrink-0">
            <Sparkles className="w-6 h-6 animate-pulse text-amber-300" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white flex items-center space-x-2">
              <span>AI AGENT LAYER</span>
              <span className="text-[10px] font-normal uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/30">
                Intelligence & Orchestration
              </span>
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xl pt-0.5">
              Admin AI Coordinator with 7 Specialized AI Agents working directly across all 11 Admin modules and 7 User Access channels on a unified data layer.
            </p>
          </div>
        </div>

        {/* 4 Core Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 mt-3 border-t border-white/10 text-center text-xs">
          <div className="p-2 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[10px] text-blue-200 uppercase font-medium">Orchestrator</span>
            <p className="text-xs font-bold text-white">AI Coordinator</p>
          </div>
          <div className="p-2 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[10px] text-blue-200 uppercase font-medium">Specialized</span>
            <p className="text-xs font-bold text-emerald-300">7 AI Agents</p>
          </div>
          <div className="p-2 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[10px] text-blue-200 uppercase font-medium">Capabilities</span>
            <p className="text-xs font-bold text-purple-300">6 Core Engines</p>
          </div>
          <div className="p-2 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[10px] text-blue-200 uppercase font-medium">Central DB</span>
            <p className="text-xs font-bold text-amber-300">Single Source</p>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center space-x-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('assistant')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl whitespace-nowrap transition ${
            activeTab === 'assistant'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>AI Assistant</span>
        </button>

        <button
          onClick={() => setActiveTab('agents')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl whitespace-nowrap transition ${
            activeTab === 'agents'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>7 Specialized Agents</span>
        </button>

        <button
          onClick={() => setActiveTab('capabilities')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl whitespace-nowrap transition ${
            activeTab === 'capabilities'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Capabilities & Memory</span>
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
          <span>AI Activity Log</span>
        </button>
      </div>

      {/* TAB 1: AI ASSISTANT */}
      {activeTab === 'assistant' && (
        <AiAssistantView
          onBack={onBack}
          onNavigateToModule={onNavigateToModule}
          lang={lang}
        />
      )}

      {/* TAB 2: 7 SPECIALIZED AGENTS WORKBENCH */}
      {activeTab === 'agents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              7 Specialized AI Agents Status & Responsibilities
            </h2>
            <span className="text-[11px] text-slate-500">Autonomous & Controlled Workflows</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* 1. Ticket Resolution Agent */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      1. Ticket Resolution Agent
                    </h3>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Facility • Housekeeping • Transport • Utilities
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Active
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Creates, assigns, monitors SLA compliance, handles escalations, and manages resolution verification. Never closes critical tickets without verified sign-off.
              </p>

              {/* 9 Lifecycle states display */}
              <div className="space-y-1 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl text-[11px]">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Enforced Ticket Lifecycle (9 Stages):
                </span>
                <div className="flex flex-wrap gap-1 text-[10px]">
                  {['New', 'Assigned', 'Accepted', 'In Progress', 'Pending', 'Resolved', 'Verified', 'Closed', 'Reopened'].map((st, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-mono border border-slate-200 dark:border-slate-600">
                      {i + 1}. {st}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Notification & Communication Agent */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600">
                    <Radio className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      2. Notification & Communication Agent
                    </h3>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Multi-Channel Engine (Strictly No WhatsApp)
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Active
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Dispatches broadcast notifications, SLA warning alerts, approval requests, and gate pass receipts across Mobile App, Mobile SMS, Outlook Email, and Microsoft Teams.
              </p>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl space-y-1 text-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Active Dispatched Channels:
                </span>
                <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">Mobile App PWA</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">Mobile SMS Gateway</span>
                  <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">Email / Outlook</span>
                  <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">Microsoft Teams</span>
                </div>
              </div>
            </div>

            {/* 3. Workflow Automation Agent */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600">
                    <GitBranch className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      3. Workflow Automation Agent
                    </h3>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Sequential & Parallel Approval Engine
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Active
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Executes SOP-driven workflows, routing approval tickets from Department Supervisor → Admin Custodian → Security Gate Officer with SLA timers.
              </p>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl space-y-1.5 text-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Active Workflow Rules ({workflowRules.length}):
                </span>
                {workflowRules.map(rule => (
                  <div key={rule.id} className="text-[11px] p-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                    <span className="font-bold text-blue-600 dark:text-blue-400">{rule.name}</span>
                    <span className="text-[10px] text-slate-500 block">Stages: {rule.stages.map(s => s.role).join(' → ')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Data & Insight Agent */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      4. Data & Insight Agent
                    </h3>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Cross-Module Telemetry & Analytics
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Active
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Calculates real-time KPIs, detects anomalies, and generates actionable operational recommendations across all 11 modules.
              </p>

              <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-[10px] text-slate-400 block">Open Tickets</span>
                  <span className="font-bold text-blue-600 text-sm">{operationalData.openComplaints}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-[10px] text-slate-400 block">Campus Visitors</span>
                  <span className="font-bold text-emerald-600 text-sm">{operationalData.activeVisitors}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-[10px] text-slate-400 block">Expiring AMCs</span>
                  <span className="font-bold text-amber-600 text-sm">{operationalData.expiringVendors}</span>
                </div>
              </div>
            </div>

            {/* 5. Knowledge Agent */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      5. Knowledge Agent
                    </h3>
                    <span className="text-[10px] text-slate-500 font-mono">
                      RAG-Ready Approved SOP Retrieval
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Active
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Performs exact and semantic retrieval strictly from approved SOPs and Policies. Explicitly reports "Information not available" if outside approved sources to eliminate hallucinations.
              </p>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Quick search approved SOPs / Policies..."
                  value={kbSearch}
                  onChange={(e) => setKbSearch(e.target.value)}
                  className="w-full text-xs p-2 pl-7 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
              </div>

              <div className="max-h-32 overflow-y-auto space-y-1.5 text-xs">
                {filteredKb.slice(0, 3).map(k => (
                  <div key={k.id} className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-[11px]">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{k.title}</span>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 ml-1 font-mono">[{k.category}]</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. Integration Agent */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-cyan-600">
                    <Network className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      6. Integration Agent
                    </h3>
                    <span className="text-[10px] text-slate-500 font-mono">
                      7 Approved Connectors Health Monitor
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  All 7 Healthy
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Monitors latency, synchronization, and health for all 7 authorized channels. Restricts unauthorized third-party systems (No SAP, HRMS, Payment, WhatsApp).
              </p>

              <div className="space-y-1 text-xs">
                {connectors.slice(0, 4).map(c => (
                  <div key={c.id} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-[11px]">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{c.name}</span>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">{c.latencyMs}ms • {c.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 7. Learning & Improvement Agent */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 md:col-span-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      7. Learning & Improvement Agent
                    </h3>
                    <span className="text-[10px] text-slate-500 font-mono">
                      User Feedback • Bottleneck Analysis • Human-in-the-Loop Admin Approval
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  Governance Active
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Analyzes repeated issues, identifies process bottlenecks, and recommends optimizations. Enforces critical policy: <span className="font-bold text-rose-600 dark:text-rose-400">AI cannot auto-alter business rules; all recommendations require authorized Admin approval</span>.
              </p>

              {/* Pending Process Recommendations */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  AI Recommendations Requiring Human Admin Approval:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {operationalData.recommendations.map(rec => (
                    <div key={rec.id} className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-900 dark:text-amber-200">{rec.detectedBottleneck}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
                          {rec.approvalStatus}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-700 dark:text-slate-300">{rec.recommendation}</p>
                      <span className="text-[10px] text-slate-500 block italic">Expected Impact: {rec.expectedImpact}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedback Submission Widget */}
              <form onSubmit={handleFeedbackSubmit} className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Submit Agent Feedback & Observations:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(['Helpful', 'Not Helpful', 'Correct', 'Incorrect', 'Suggestion', 'Complaint'] as FeedbackType[]).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFeedbackType(type)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold transition ${
                        feedbackType === type
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Enter observations on AI intent detection, SLA handling, or workflow accuracy..."
                    className="flex-1 text-xs px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow"
                  >
                    Submit Feedback
                  </button>
                </div>

                {feedbackSuccess && (
                  <p className="text-xs text-emerald-600 font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Feedback recorded in Learning Agent memory for Admin review!</span>
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AI CAPABILITIES & MEMORY STORES */}
      {activeTab === 'capabilities' && (
        <div className="space-y-4">
          {/* 6 AI Capabilities Architecture */}
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              AI Capabilities Architecture
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                <div className="flex items-center space-x-1.5 font-bold text-blue-600">
                  <Zap className="w-4 h-4" />
                  <span>1. Natural Language Processing</span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Intent detection, text classification, search, multilingual complaint categorization, priority suggestion.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                <div className="flex items-center space-x-1.5 font-bold text-purple-600">
                  <Cpu className="w-4 h-4" />
                  <span>2. Machine Learning</span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Pattern detection, classification, recommendation, anomaly detection across sensor telemetry.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                <div className="flex items-center space-x-1.5 font-bold text-indigo-600">
                  <Bot className="w-4 h-4" />
                  <span>3. Generative AI / LLM</span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Conversational assistant, summaries, SOP Q&A, draft responses, governed report generation.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                <div className="flex items-center space-x-1.5 font-bold text-teal-600">
                  <Scan className="w-4 h-4" />
                  <span>4. Computer Vision</span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  OCR document parsing, QR code verification, asset barcode reading (no facial recognition).
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                <div className="flex items-center space-x-1.5 font-bold text-amber-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>5. Predictive Analytics</span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  SLA breach risks, energy consumption surges, asset maintenance risks (all marked as estimates).
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                <div className="flex items-center space-x-1.5 font-bold text-rose-600">
                  <Sliders className="w-4 h-4" />
                  <span>6. RPA Automation</span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Automated reminders, scheduled daily reports, task auto-creation, status synchronization.
                </p>
              </div>
            </div>
          </div>

          {/* Predictive Analytics Live Estimates */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center space-x-1.5">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                <span>Predictive Analytics Engine (Estimates Only)</span>
              </h3>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded font-bold">
                ⚠️ System Estimates Notice Enforced
              </span>
            </div>

            <div className="space-y-2">
              {operationalData.predictiveInsights.map(pred => (
                <div key={pred.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-600 dark:text-blue-400">{pred.metric}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
                      {pred.confidence}% Confidence
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">{pred.prediction}</p>
                  <p className="text-[11px] text-slate-500">Recommended Action: {pred.recommendedAction}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 6 Logical Memory Components */}
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Agent Memory & Knowledge Components
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                <div className="flex items-center space-x-1.5 font-bold text-blue-600">
                  <Database className="w-4 h-4" />
                  <span>1. Vector Knowledge Store</span>
                </div>
                <p className="text-slate-500 text-[11px]">Approved knowledge embeddings & semantic SOP search.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                <div className="flex items-center space-x-1.5 font-bold text-purple-600">
                  <GitBranch className="w-4 h-4" />
                  <span>2. Process Knowledge Base</span>
                </div>
                <p className="text-slate-500 text-[11px]">Workflows, business SOPs, and approval rules.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                <div className="flex items-center space-x-1.5 font-bold text-teal-600">
                  <Clock className="w-4 h-4" />
                  <span>3. Historical Data Memory</span>
                </div>
                <p className="text-slate-500 text-[11px]">Past tickets, resolutions, trends, and audited transactions.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                <div className="flex items-center space-x-1.5 font-bold text-amber-600">
                  <Bot className="w-4 h-4" />
                  <span>4. User Interaction History</span>
                </div>
                <p className="text-slate-500 text-[11px]">Previous queries, responses, feedback, and active context.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                <div className="flex items-center space-x-1.5 font-bold text-rose-600">
                  <FileText className="w-4 h-4" />
                  <span>5. Policy & SOP Repository</span>
                </div>
                <p className="text-slate-500 text-[11px]">Company policies, procedures, manuals, and official documents.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                <div className="flex items-center space-x-1.5 font-bold text-indigo-600">
                  <Sliders className="w-4 h-4" />
                  <span>6. Rules Engine</span>
                </div>
                <p className="text-slate-500 text-[11px]">Priority rules, SLA timers, escalation tiers, automation rules.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AI ACTIVITY LOG (SEARCHABLE & AUDITABLE) */}
      {activeTab === 'logs' && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Auditable AI Activity Log
              </h2>
              <p className="text-[11px] text-slate-500">
                Complete record of intent detection, module routing, actions, and approvals
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search logs by intent, module, agent..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                className="w-full text-xs p-2 pl-7 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
            </div>
          </div>

          <div className="space-y-2">
            {filteredLogs.map(log => (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] font-bold text-slate-500">{log.id}</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{log.detectedIntent}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    log.approvalStatus === 'Approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                    log.approvalStatus === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {log.approvalStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">User:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">{log.user}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Selected Module:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">{log.selectedModule}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Orchestrated Agent:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">{log.selectedAgent}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Timestamp:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">{log.date} {log.time}</span>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-[11px] space-y-0.5">
                  <p className="text-slate-700 dark:text-slate-300"><span className="font-bold">Request:</span> "{log.request}"</p>
                  <p className="text-slate-700 dark:text-slate-300"><span className="font-bold">Action Performed:</span> {log.actionPerformed}</p>
                  <p className="text-emerald-700 dark:text-emerald-400 font-medium"><span className="font-bold">Result:</span> {log.result}</p>
                </div>
              </div>
            ))}

            {filteredLogs.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400">
                No matching AI activity logs found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
